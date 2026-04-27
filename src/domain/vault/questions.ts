export type VaultQuestionCategory =
  | "hidden-spending"
  | "financial-guilt"
  | "family-money-tension"
  | "hidden-generosity"
  | "comparison-anxiety"
  | "future-fear"
  | "aging-parents"
  | "kids-future"
  | "husband-wife-asymmetry"
  | "self-care-guilt"
  | "festival-pressure";

export type VaultQuestion = {
  id: string;
  category: VaultQuestionCategory;
  language: "hi-IN";
  text: string;
};

const categoryOrder: VaultQuestionCategory[] = [
  "hidden-spending",
  "financial-guilt",
  "family-money-tension",
  "hidden-generosity",
  "comparison-anxiety",
  "future-fear",
  "aging-parents",
  "kids-future",
  "husband-wife-asymmetry",
  "self-care-guilt",
  "festival-pressure",
];

const textsByCategory: Record<VaultQuestionCategory, string[]> = {
  "hidden-spending": [
    "Aaj kuch kharch hua jo aap pati ko nahi bata rahi? Mujhe bata sakti hain — yeh sirf aapke paas rahega.",
    "Aaj kisi chhote kharche ko chhupane ka mann hua? Amount chhota ho ya bada, feeling important hai.",
    "Aaj online ya bazaar mein kuch liya aur socha 'baad mein bataungi'? Seedha bol dijiye, judgement nahi hai.",
    "Aaj ghar ke hisaab mein koi kharcha adjust kiya jo asli reason se alag hai?",
    "Aaj cash se kuch kharida kyunki account statement mein nahi dikhna chahiye tha?",
    "Aaj kisi subscription, beauty, kapde, ya gift ka kharcha guilt ke saath hua?",
    "Aaj apne liye kuch kharcha kiya aur turant justify karna pada apne mann mein?",
    "Aaj koi kharcha aisa tha jo zaroori bhi laga aur chhupane layak bhi?",
    "Aaj ke kharchon mein ek baat jo kisi ko nahi pata — woh mujhe bata dijiye.",
  ],
  "financial-guilt": [
    "Aaj koi cheez dekhi jo aapko lagi 'yeh kharcha shayad zaroori nahi tha'? Boliye, judgement nahi karunga.",
    "Aaj kis kharche ke baad mann mein halka sa bojh aaya?",
    "Aaj paisa kharch karne ke baad laga ki ghar ke liye kuch aur karna chahiye tha?",
    "Aaj kisi bill ya payment ko dekh ke apne aap se naraaz hui?",
    "Aaj aapne kisi kharche ko 'bas is baar' bolkar allow kiya?",
    "Aaj kaunsa kharcha tha jisme zaroorat aur guilt dono saath aaye?",
    "Aaj aapne apne aap ko paise ke mamle mein strict judge kiya?",
    "Aaj kisi purane financial decision ki yaad aayi jiska guilt abhi bhi rehta hai?",
    "Aaj paise ko leke ek chhoti si chinta thi jo bolne layak nahi lagi — woh boliye.",
  ],
  "family-money-tension": [
    "Aaj koi family member ne paisa maanga? Comfortable thi dene mein, ya kuch ankahi tension thi?",
    "Aaj ghar mein paise ki baat hui aur aapne kuch andar hi andar rok liya?",
    "Aaj kisi rishtedaar ke kharche ya demand se irritation hua?",
    "Aaj family ko help karna duty laga ya pressure?",
    "Aaj kisi ne aapke financial decision par comment kiya?",
    "Aaj ghar ke kisi kharche mein aapki marzi poori tarah poochhi gayi?",
    "Aaj kisi ko 'nahi' bolna tha paise ke mamle mein, par bol nahi paayi?",
    "Aaj kisi family expectation ne aapka budget hilaya?",
    "Aaj family ke naam par kharcha karte hue aapko khushi zyada thi ya bojh?",
  ],
  "hidden-generosity": [
    "Aaj kisi ko kuch diya jo apke pati ko nahi pata? Sometimes secret kindness bhi acchi hoti hai.",
    "Aaj kisi ki madad quietly ki? Amount nahi, niyat bata dijiye.",
    "Aaj kisi bachche, parent, staff, ya rishtedaar ke liye chhota sa kharcha kiya?",
    "Aaj kisi ko paise diye aur socha ghar mein discuss karna mushkil hoga?",
    "Aaj kisi ki zaroorat dekh ke aapka dil pighla?",
    "Aaj kisi ko gift ya help dete waqt apni savings ka khayal aaya?",
    "Aaj generosity aur budget ke beech kahan atki?",
    "Aaj kisi ko help karke achha laga, par thoda darr bhi laga?",
    "Aaj ki ek kindness jo private rehni chahiye — bas mujhe bata dijiye.",
  ],
  "comparison-anxiety": [
    "Aaj kisi ki cheez dekh ke laga 'humare paas yeh kyun nahi'? Yeh feeling normal hai. Boliye toh sahi.",
    "Aaj kisi friend ya rishtedaar ki lifestyle dekh ke apna ghar compare kiya?",
    "Aaj kisi bachche ki school, coaching, ya activity dekh ke pressure feel hua?",
    "Aaj social media par koi cheez dekhi jisse laga hum peeche hain?",
    "Aaj kisi ke naye phone, car, jewellery, ya trip ne mann hilaya?",
    "Aaj comparison se zyada jalan thi ya chinta?",
    "Aaj kaunsi baat ne aapko sochne pe majboor kiya ki 'kya hum enough kar rahe hain?'",
    "Aaj kisi aur ke financial progress se apni planning par doubt aaya?",
    "Aaj comparison aaya toh uske neeche asli darr kya tha?",
  ],
  "future-fear": [
    "Aaj kuch socha jo dar lag raha hai paise ke baare mein? Mujhe bataiye, plan banaate hain.",
    "Aaj future ka kaunsa kharcha sabse bada laga?",
    "Aaj retirement, health, bachhon, ya ghar ke baare mein kaunsa thought baar-baar aaya?",
    "Aaj agar ek financial darr ka naam rakhna ho, woh kya hoga?",
    "Aaj laga ki income enough nahi hogi kisi future need ke liye?",
    "Aaj emergency ke baare mein soch ke tension hui?",
    "Aaj kisi unexpected kharche ka darr aaya?",
    "Aaj paise ke future ko leke sabse zyada uncertainty kahan hai?",
    "Aaj ek line mein boliye: kis baat ke liye plan banne se neend better hogi?",
  ],
  "aging-parents": [
    "Aaj mummy/papa ke kuch kharche the? Aapko kuch dikhta hai jo woh nahi bata rahe?",
    "Aaj parents ki health ya medicine ke kharche ka thought aaya?",
    "Aaj laga ki mummy/papa apni need chhupa rahe hain?",
    "Aaj parents ke liye paisa side mein rakhne ka mann hua?",
    "Aaj kisi elder ka medical ya comfort expense postpone hua?",
    "Aaj parents ko help karne aur apne ghar ka budget sambhalne ke beech tension thi?",
    "Aaj mummy/papa ke future care ke baare mein koi chinta aayi?",
    "Aaj unke liye kuch karna tha par paise ke wajah se ruk gayi?",
    "Aaj parents ke mamle mein ek financial baat jo kisi se nahi boli — yahan bol sakti hain.",
  ],
  "kids-future": [
    "Aaj bachhon ke baare mein paisa-related kuch socha? Bolo, sun raha hoon.",
    "Aaj Priya ya Aarav ke future ka kaunsa kharcha dimaag mein aaya?",
    "Aaj school, coaching, shaadi, ya health ke kharche mein se kya zyada heavy laga?",
    "Aaj bachhon ko kuch dena chaha par budget ne roka?",
    "Aaj kisi aur ke bachche ko dekh ke apne bachhon ke liye pressure feel hua?",
    "Aaj laga ki bachhon ke liye aap enough kar rahi hain ya nahi?",
    "Aaj ek child-related expense tha jo planning maangta hai?",
    "Aaj bachhon ke future ke liye ek chhota step kya lena chahti thi?",
    "Aaj Priya/Aarav ko lekar money wali ek private chinta bata dijiye.",
  ],
  "husband-wife-asymmetry": [
    "Aaj pati ne kuch share kiya money ke baare mein? Aap comfortable hain unke decisions se?",
    "Aaj household money decisions mein aapki awaaz kitni thi?",
    "Aaj Rajesh ji ke remittance ya spending ko leke kuch mann mein raha?",
    "Aaj kisi financial baat par unse poochhna tha par poochha nahi?",
    "Aaj laga ki zimmedari aap par zyada hai par control kam?",
    "Aaj pati ke kisi money decision se relief mila ya tension?",
    "Aaj aapne unse kuch hide kiya paise ke mamle mein, ya unhone aapse?",
    "Aaj partnership jaisi feeling thi ya akela manage karne wali?",
    "Aaj husband-wife money equation mein ek sach bolna ho toh kya bolengi?",
  ],
  "self-care-guilt": [
    "Aaj apne liye kuch lena chahti thi but nahi liya kyunki paisa? Boliye.",
    "Aaj apni health, kapde, rest, ya khushi par kharcha rok diya?",
    "Aaj apni need ko ghar ke kharche ke neeche rakh diya?",
    "Aaj apne liye kharcha karna selfish laga?",
    "Aaj kaunsa self-care expense actually zaroori tha par postpone hua?",
    "Aaj aapne apne aap ko kis cheez ke liye mana kiya?",
    "Aaj agar guilt na hota toh apne liye kya leti?",
    "Aaj apne comfort ko budget mein jagah mili ya nahi?",
    "Aaj apne liye ek chhoti financial permission deni ho toh kya hogi?",
  ],
  "festival-pressure": [
    "Aaj kisi ne festival ke kharche ke baare mein poocha? Aapki taraf kya planning hai?",
    "Aaj gift, kapde, mithai, ya safai ke budget ka thought aaya?",
    "Aaj festival ke naam par khushi zyada mehsoos hui ya pressure?",
    "Aaj in-laws aur apne ghar ke festival expectations mein balance kaise laga?",
    "Aaj Dhanteras, Diwali, Rakhi, ya kisi function ke kharche ka stress aaya?",
    "Aaj kisi tradition ko nibhaane ke liye paisa stretch karna pad sakta hai?",
    "Aaj festival shopping dekh ke mann hua, par budget ne roka?",
    "Aaj kisi ko gift dene ki list dimaag mein bani?",
    "Aaj festival ke mamle mein ek sach: kis cheez ka pressure sabse zyada hai?",
  ],
};

export const VAULT_QUESTIONS: VaultQuestion[] = categoryOrder.flatMap((category) =>
  textsByCategory[category].map((text, index) => ({
    id: `${category}-${String(index + 1).padStart(2, "0")}`,
    category,
    language: "hi-IN",
    text,
  })),
);

export function getVaultQuestionById(id: string): VaultQuestion | undefined {
  return VAULT_QUESTIONS.find((question) => question.id === id);
}

export function pickNextVaultQuestion(args: {
  recentQuestionIds?: string[];
  recentCategories?: VaultQuestionCategory[];
  now?: Date;
} = {}): VaultQuestion {
  const recentQuestionIds = new Set(args.recentQuestionIds ?? []);
  const recentCategories = new Set(args.recentCategories ?? []);
  const todayIndex = Math.floor((args.now ?? new Date()).getTime() / 86_400_000);

  const category =
    categoryOrder.find((candidate, offset) => {
      const rotated = categoryOrder[(todayIndex + offset) % categoryOrder.length];
      return !recentCategories.has(rotated) && candidate === rotated;
    }) ?? categoryOrder[todayIndex % categoryOrder.length];

  const candidates = VAULT_QUESTIONS.filter(
    (question) => question.category === category && !recentQuestionIds.has(question.id),
  );
  if (candidates.length > 0) return candidates[todayIndex % candidates.length];
  return VAULT_QUESTIONS.find((question) => !recentQuestionIds.has(question.id)) ?? VAULT_QUESTIONS[0];
}
