import { getSupabaseDemoClient, DEMO_USER_ID } from "@/lib/db/server-anon";
import { ANJALI } from "@/lib/mocks/demo-personas";
import {
  VAULT_QUESTIONS,
  getVaultQuestionById,
  pickNextVaultQuestion,
  type VaultQuestion,
  type VaultQuestionCategory,
} from "./questions";
import { decryptVaultText, encryptVaultText } from "./crypto";

export type VaultConfession = {
  id: string;
  userId: string;
  askedAt: string;
  questionId: string | null;
  questionText: string;
  responseAudioUrl: string | null;
  responseTranscript: string | null;
  saathiReflectionAudioUrl: string | null;
  saathiReflectionText: string | null;
  emotionTags: string[];
  isShared: boolean;
  sharedWith: string[];
};

export type VaultStreak = {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastConfessionAt: string | null;
  totalConfessions: number;
  eveningQuestionTime: string;
  timezone: string;
};

export type VaultMonthlyReflection = {
  id: string;
  userId: string;
  month: string;
  reflectionText: string;
  reflectionAudioUrl: string | null;
  source: string;
  createdAt: string;
};

type RawConfession = {
  id: string;
  user_id: string;
  asked_at: string;
  question_id: string | null;
  question_text: string;
  response_audio_url: string | null;
  response_transcript: string | null;
  saathi_reflection_audio_url: string | null;
  saathi_reflection_text: string | null;
  emotion_tags: string[] | null;
  is_shared: boolean;
  shared_with: string[] | null;
};

type RawStreak = {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_confession_at: string | null;
  total_confessions: number;
  evening_question_time: string;
  timezone: string;
};

type RawMonthlyReflection = {
  id: string;
  user_id: string;
  month: string;
  reflection_text: string;
  reflection_audio_url: string | null;
  source: string;
  created_at: string;
};

function fromRawConfession(row: RawConfession): VaultConfession {
  return {
    id: row.id,
    userId: row.user_id,
    askedAt: row.asked_at,
    questionId: row.question_id,
    questionText: row.question_text,
    responseAudioUrl: decryptVaultText(row.response_audio_url, row.user_id),
    responseTranscript: decryptVaultText(row.response_transcript, row.user_id),
    saathiReflectionAudioUrl: decryptVaultText(row.saathi_reflection_audio_url, row.user_id),
    saathiReflectionText: decryptVaultText(row.saathi_reflection_text, row.user_id),
    emotionTags: row.emotion_tags ?? [],
    isShared: row.is_shared,
    sharedWith: row.shared_with ?? [],
  };
}

function fromRawStreak(row: RawStreak): VaultStreak {
  return {
    userId: row.user_id,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastConfessionAt: row.last_confession_at,
    totalConfessions: row.total_confessions,
    eveningQuestionTime: row.evening_question_time,
    timezone: row.timezone,
  };
}

function fromRawReflection(row: RawMonthlyReflection): VaultMonthlyReflection {
  return {
    id: row.id,
    userId: row.user_id,
    month: row.month,
    reflectionText: decryptVaultText(row.reflection_text, row.user_id) ?? "",
    reflectionAudioUrl: decryptVaultText(row.reflection_audio_url, row.user_id),
    source: row.source,
    createdAt: row.created_at,
  };
}

export async function ensureVaultQuestionsSeeded() {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return;
  const { count, error } = await supabase
    .from("vault_questions" as never)
    .select("id", { count: "exact", head: true });
  if (error) return;
  if ((count ?? 0) >= VAULT_QUESTIONS.length) return;
  await supabase.from("vault_questions" as never).upsert(
    VAULT_QUESTIONS.map((question) => ({
      id: question.id,
      category: question.category,
      language: question.language,
      text: question.text,
    })) as never,
  );
}

export async function getVaultStreak(userId = DEMO_USER_ID): Promise<VaultStreak> {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return mockStreak();
  const { data, error } = await supabase
    .from("vault_streaks" as never)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return mockStreak();
  return fromRawStreak(data as unknown as RawStreak);
}

export async function listVaultConfessions(userId = DEMO_USER_ID, limit = 50): Promise<VaultConfession[]> {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return mockConfessions();
  const { data, error } = await supabase
    .from("vault_confessions" as never)
    .select("*")
    .eq("user_id", userId)
    .not("response_transcript", "is", null)
    .order("asked_at", { ascending: false })
    .limit(limit);
  if (error || !data || data.length === 0) return mockConfessions();
  return (data as unknown as RawConfession[]).map(fromRawConfession);
}

export async function getVaultConfession(id: string, userId = DEMO_USER_ID): Promise<VaultConfession | null> {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return mockConfessions().find((entry) => entry.id === id) ?? null;
  const { data, error } = await supabase
    .from("vault_confessions" as never)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return mockConfessions().find((entry) => entry.id === id) ?? null;
  return fromRawConfession(data as unknown as RawConfession);
}

export async function createEveningQuestion(userId = DEMO_USER_ID): Promise<{
  confessionId: string | null;
  question: VaultQuestion;
}> {
  await ensureVaultQuestionsSeeded();
  const recent = await listRecentQuestionHistory(userId);
  const question = pickNextVaultQuestion(recent);
  const supabase = getSupabaseDemoClient();
  if (!supabase) return { confessionId: null, question };

  const { data, error } = await supabase
    .from("vault_confessions" as never)
    .insert({
      user_id: userId,
      asked_at: new Date().toISOString(),
      question_id: question.id,
      question_text: question.text,
      is_shared: false,
      shared_with: [],
    } as never)
    .select("id")
    .maybeSingle();

  await supabase
    .from("vault_questions" as never)
    .update({ last_used_at: new Date().toISOString() } as never)
    .eq("id", question.id);

  return { confessionId: error ? null : ((data as { id?: string } | null)?.id ?? null), question };
}

export async function saveVaultResponse(args: {
  userId?: string;
  confessionId?: string | null;
  questionId?: string | null;
  questionText: string;
  responseTranscript: string;
  responseAudioUrl?: string | null;
  saathiReflectionText: string;
  saathiReflectionAudioUrl?: string | null;
  emotionTags: string[];
}): Promise<VaultConfession> {
  const userId = args.userId ?? DEMO_USER_ID;
  const supabase = getSupabaseDemoClient();
  const now = new Date().toISOString();

  if (!supabase) {
    return {
      id: args.confessionId ?? "vault-demo-new",
      userId,
      askedAt: now,
      questionId: args.questionId ?? null,
      questionText: args.questionText,
      responseAudioUrl: args.responseAudioUrl ?? null,
      responseTranscript: args.responseTranscript,
      saathiReflectionAudioUrl: args.saathiReflectionAudioUrl ?? null,
      saathiReflectionText: args.saathiReflectionText,
      emotionTags: args.emotionTags,
      isShared: false,
      sharedWith: [],
    };
  }

  const patch = {
    user_id: userId,
    asked_at: now,
    question_id: args.questionId,
    question_text: args.questionText,
    response_audio_url: encryptVaultText(args.responseAudioUrl, userId),
    response_transcript: encryptVaultText(args.responseTranscript, userId),
    saathi_reflection_audio_url: encryptVaultText(args.saathiReflectionAudioUrl, userId),
    saathi_reflection_text: encryptVaultText(args.saathiReflectionText, userId),
    emotion_tags: args.emotionTags,
    is_shared: false,
    shared_with: [],
  };

  let row: RawConfession | null = null;
  if (args.confessionId) {
    const { data } = await supabase
      .from("vault_confessions" as never)
      .update(patch as never)
      .eq("id", args.confessionId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();
    row = data as unknown as RawConfession | null;
  }
  if (!row) {
    const { data } = await supabase
      .from("vault_confessions" as never)
      .insert(patch as never)
      .select("*")
      .maybeSingle();
    row = data as unknown as RawConfession | null;
  }

  await upsertVaultStreak(userId, now);
  return row ? fromRawConfession(row) : mockConfessions()[0];
}

export async function upsertMonthlyReflection(args: {
  userId?: string;
  month: string;
  reflectionText: string;
  reflectionAudioUrl?: string | null;
  source: string;
}): Promise<VaultMonthlyReflection> {
  const userId = args.userId ?? DEMO_USER_ID;
  const supabase = getSupabaseDemoClient();
  if (!supabase) {
    return {
      id: `reflection-${args.month}`,
      userId,
      month: args.month,
      reflectionText: args.reflectionText,
      reflectionAudioUrl: args.reflectionAudioUrl ?? null,
      source: args.source,
      createdAt: new Date().toISOString(),
    };
  }
  const { data } = await supabase
    .from("vault_monthly_reflections" as never)
    .upsert(
      {
        user_id: userId,
        month: args.month,
        reflection_text: encryptVaultText(args.reflectionText, userId),
        reflection_audio_url: encryptVaultText(args.reflectionAudioUrl, userId),
        source: args.source,
      } as never,
      { onConflict: "user_id,month" },
    )
    .select("*")
    .maybeSingle();
  return data
    ? fromRawReflection(data as unknown as RawMonthlyReflection)
    : {
        id: `reflection-${args.month}`,
        userId,
        month: args.month,
        reflectionText: args.reflectionText,
        reflectionAudioUrl: args.reflectionAudioUrl ?? null,
        source: args.source,
        createdAt: new Date().toISOString(),
      };
}

export async function getMonthlyReflection(month: string, userId = DEMO_USER_ID) {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("vault_monthly_reflections" as never)
    .select("*")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();
  if (error || !data) return null;
  return fromRawReflection(data as unknown as RawMonthlyReflection);
}

async function listRecentQuestionHistory(userId: string) {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return {};
  const since = new Date(Date.now() - 14 * 86_400_000).toISOString();
  const { data } = await supabase
    .from("vault_confessions" as never)
    .select("question_id")
    .eq("user_id", userId)
    .gte("asked_at", since)
    .order("asked_at", { ascending: false })
    .limit(14);
  const recentQuestionIds = ((data as unknown as Array<{ question_id: string | null }> | null) ?? [])
    .map((row) => row.question_id)
    .filter(Boolean) as string[];
  const recentCategories = recentQuestionIds
    .map((id) => getVaultQuestionById(id)?.category)
    .filter((category): category is VaultQuestionCategory => Boolean(category));
  return { recentQuestionIds, recentCategories };
}

async function upsertVaultStreak(userId: string, confessionAt: string) {
  const previous = await getVaultStreak(userId);
  const last = previous.lastConfessionAt ? new Date(previous.lastConfessionAt) : null;
  const current = new Date(confessionAt);
  const daysSince = last
    ? Math.floor((startOfDay(current).getTime() - startOfDay(last).getTime()) / 86_400_000)
    : null;
  const currentStreak =
    daysSince === 0
      ? previous.currentStreak || 1
      : daysSince === 1
        ? previous.currentStreak + 1
        : 1;
  const longestStreak = Math.max(previous.longestStreak, currentStreak);
  const totalConfessions = previous.totalConfessions + (daysSince === 0 ? 0 : 1);
  const supabase = getSupabaseDemoClient();
  if (!supabase) return;
  await supabase.from("vault_streaks" as never).upsert(
    {
      user_id: userId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_confession_at: confessionAt,
      total_confessions: totalConfessions,
      evening_question_time: previous.eveningQuestionTime,
      timezone: previous.timezone,
    } as never,
    { onConflict: "user_id" },
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function mockStreak(): VaultStreak {
  return {
    userId: ANJALI.id,
    currentStreak: 7,
    longestStreak: 21,
    lastConfessionAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    totalConfessions: 18,
    eveningQuestionTime: "21:00",
    timezone: "Asia/Kolkata",
  };
}

function mockConfessions(): VaultConfession[] {
  const now = Date.now();
  return [
    {
      id: "vault-demo-1",
      userId: ANJALI.id,
      askedAt: new Date(now - 18 * 60 * 60 * 1000).toISOString(),
      questionId: "self-care-guilt-01",
      questionText: "Aaj apne liye kuch lena chahti thi but nahi liya kyunki paisa? Boliye.",
      responseAudioUrl: null,
      responseTranscript:
        "School ke baad ek sandal dekhi thi. Purani toot rahi hai, par Priya ke school project ka kharcha yaad aa gaya. Isliye nahi li.",
      saathiReflectionAudioUrl: null,
      saathiReflectionText:
        "Suni. Yeh sacrifice aap roz quietly karti hain. Note kar raha hoon: zaroori cheez ko guilt ke neeche dabaana long-term mein heavy padta hai.",
      emotionTags: ["self-care-guilt", "kids-future", "spending"],
      isShared: false,
      sharedWith: [],
    },
    {
      id: "vault-demo-2",
      userId: ANJALI.id,
      askedAt: new Date(now - 42 * 60 * 60 * 1000).toISOString(),
      questionId: "husband-wife-asymmetry-01",
      questionText: "Aaj pati ne kuch share kiya money ke baare mein? Aap comfortable hain unke decisions se?",
      responseAudioUrl: null,
      responseTranscript:
        "Rajesh ne bola remittance iss baar 27 ko aayega, par mujhe Diwali fund ka tension abhi se ho raha hai. Unko bolungi toh woh pareshan ho jayenge.",
      saathiReflectionAudioUrl: null,
      saathiReflectionText:
        "Yeh baat samajh aayi. Aap tension share nahi karti kyunki unko tension nahi dena chahti. Saathi is pattern ko calendar mein quietly note karega.",
      emotionTags: ["husband-money", "festival-pressure", "future-fear"],
      isShared: false,
      sharedWith: [],
    },
    {
      id: "vault-demo-3",
      userId: ANJALI.id,
      askedAt: new Date(now - 66 * 60 * 60 * 1000).toISOString(),
      questionId: "aging-parents-01",
      questionText: "Aaj mummy/papa ke kuch kharche the? Aapko kuch dikhta hai jo woh nahi bata rahe?",
      responseAudioUrl: null,
      responseTranscript:
        "Papa ne medicines kam lene ki baat casually boli. Mujhe lag raha hai woh price ke wajah se skip kar rahe hain.",
      saathiReflectionAudioUrl: null,
      saathiReflectionText:
        "Suni. Parents aksar apni need halka bol dete hain. Yeh private note rahega; bas medical buffer mein isko dhyan mein rakhenge.",
      emotionTags: ["parents-care", "medical", "hidden-need"],
      isShared: false,
      sharedWith: [],
    },
  ];
}
