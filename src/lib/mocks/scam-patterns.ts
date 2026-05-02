import type { ScamPatternSeed } from "@/domain/types";

/**
 * Bharosa scam pattern bank.
 *
 * ~50 high-fidelity exemplars across every major typology Bharat
 * households encounter on WhatsApp / SMS / voice calls in 2025. Sourced
 * from MHA I4C cybercrime advisories, RBI Sachet complaint patterns,
 * ICICI/SBI "do not respond" advisories, NCRB cyber-crime reports, and
 * news cycles around digital arrest, SIM swap, AePS cloning, and
 * Chinese loan-app harassment. The seed script computes embeddings and
 * inserts into `scam_patterns`.
 *
 * Authenticity rules:
 *   - Use the actual phrases scammers use, not paraphrases.
 *   - Variants A/B/C reflect real regional flavours (Hindi, Hinglish,
 *     English, plus the occasional Devanagari romanisation a scammer
 *     would actually send).
 *   - identifyingPhrases must be specific enough that an embedding
 *     nearest-neighbour catches paraphrased variants too — short
 *     trigger words + the unique URL/domain fragments work best.
 */

export const SCAM_PATTERNS_SEED: ScamPatternSeed[] = [
  // ---------- KBC LOTTERY ----------
  {
    patternName: "kbc-lottery-A-hindi",
    category: "lottery",
    language: "hi-IN",
    representativeText:
      "Mubarak ho! Aap KBC ke lottery mein 25,00,000 jeete hain. Apna lucky number 4509 confirm karne ke liye is number par WhatsApp call karein: +92 3XX XXXXXXX. Yeh offer 24 ghante mein expire ho jayega.",
    identifyingPhrases: [
      "KBC",
      "Kaun Banega Crorepati",
      "lucky number",
      "lottery jeete",
      "25 lakh",
      "+92",
    ],
    payloadType: "money-transfer",
    severity: "high",
    notes: "Pakistan country code (+92) is a strong signal. Real KBC never DMs winners.",
  },
  {
    patternName: "kbc-lottery-B-hinglish",
    category: "lottery",
    language: "hi-IN",
    representativeText:
      "Congratulations 🎉 You have won KBC Lottery 25,00,000 INR. Send your full name, Aadhaar number and bank IFSC to claim within 6 hours. Your booking ID: KBC-IND-78231.",
    identifyingPhrases: [
      "KBC Lottery",
      "send Aadhaar",
      "bank IFSC",
      "booking ID",
      "claim within",
    ],
    payloadType: "credential-harvest",
    severity: "high",
  },
  {
    patternName: "kbc-lottery-C-voice",
    category: "lottery",
    language: "hi-IN",
    representativeText:
      "Namaste, main KBC office se Vikas Verma bol raha hoon. Aapka mobile number lottery mein select hua hai 25 lakh ke liye. Bas ek processing fee 8,500 deni hogi UPI pe — refundable hai.",
    identifyingPhrases: [
      "KBC office se",
      "processing fee",
      "refundable",
      "UPI pe",
      "select hua hai",
    ],
    payloadType: "money-transfer",
    severity: "high",
  },

  // ---------- BANK ACCOUNT FREEZE ----------
  {
    patternName: "bank-freeze-hdfc",
    category: "banking-impersonation",
    language: "hi-IN",
    representativeText:
      "Dear customer, aapka HDFC Bank account 24 ghante mein BAND ho jaayega. Tatkal KYC update karein: hdfc-update.online/verify. Customer Care: 8***-4567.",
    identifyingPhrases: [
      "account band ho jaayega",
      "KYC update",
      ".online",
      "tatkal",
      "Customer Care",
    ],
    payloadType: "credential-harvest",
    severity: "high",
  },
  {
    patternName: "bank-freeze-sbi",
    category: "banking-impersonation",
    language: "hi-IN",
    representativeText:
      "SBI: Aapka account today aakhri din hai PAN-Aadhaar link karne ke liye. 1000/- ka late fee bachne ke liye yahan click karein: sbi-link.in",
    identifyingPhrases: ["PAN-Aadhaar link", "late fee", "aakhri din", "sbi-link.in"],
    payloadType: "credential-harvest",
    severity: "high",
  },

  // ---------- DIGITAL ARREST ----------
  {
    patternName: "digital-arrest-mumbai",
    category: "digital-arrest",
    language: "hi-IN",
    representativeText:
      "Yeh Mumbai Crime Branch hai. Aapke naam pe ek parcel pakda gaya hai jismein drugs hain. Aap ko abhi video call pe aana hoga warna gaiftari. Skype ID share kar rahe hain.",
    identifyingPhrases: [
      "Mumbai Crime Branch",
      "parcel",
      "drugs",
      "video call",
      "Skype",
      "gaiftari",
    ],
    payloadType: "money-transfer",
    severity: "high",
    notes: "No real police force conducts 'digital arrest' over video. Always a scam.",
  },
  {
    patternName: "digital-arrest-cbi",
    category: "digital-arrest",
    language: "hi-IN",
    representativeText:
      "CBI Officer Ramesh bol raha hoon. Aapke Aadhaar se bank account khula hai jismein 2 crore ki money laundering hui hai. Cooperate karein warna 24 ghante mein arrest. Camera on rakhein.",
    identifyingPhrases: ["CBI Officer", "money laundering", "camera on", "Aadhaar se bank account"],
    payloadType: "money-transfer",
    severity: "high",
  },

  // ---------- TAX REFUND ----------
  {
    patternName: "tax-refund-itd",
    category: "tax-refund",
    language: "hi-IN",
    representativeText:
      "Income Tax Refund of Rs 18,540 approved. Update your account at: incometax-refund.in/verify within 24 hours. — Income Tax Dept.",
    identifyingPhrases: [
      "Income Tax Refund",
      "incometax-refund.in",
      "approved",
      "update your account",
    ],
    payloadType: "credential-harvest",
    severity: "medium",
  },

  // ---------- AADHAAR UPDATE ----------
  {
    patternName: "aadhaar-update-uidai",
    category: "kyc-update",
    language: "hi-IN",
    representativeText:
      "UIDAI: Aadhaar 10 saal purana hai. Free update ke liye yahan click: uidai-services.in. Last date 31 March.",
    identifyingPhrases: ["UIDAI", "10 saal purana", "uidai-services.in", "Last date"],
    payloadType: "credential-harvest",
    severity: "medium",
  },

  // ---------- ELECTRICITY DISCONNECT ----------
  {
    patternName: "electricity-disconnect-uppcl",
    category: "utility-scam",
    language: "hi-IN",
    representativeText:
      "Pyare upbhokta, aapka bijli bill update nahi hua hai. Aaj raat 9:30 baje connection kat diya jayega. Turant baat karein: +91-9XX-XXXXXX (UPPCL Officer).",
    identifyingPhrases: [
      "bijli bill",
      "connection kat",
      "raat 9:30",
      "UPPCL Officer",
    ],
    payloadType: "money-transfer",
    severity: "high",
  },

  // ---------- TELEGRAM TIPSTER ----------
  {
    patternName: "telegram-tipster-options",
    category: "investment-scheme",
    language: "hi-IN",
    representativeText:
      "Friends ️ Today's BANKNIFTY call: BUY 51200 CE @ 145 SL 120 TGT 220. 100% accurate hits. Premium group join karein for 100% profit guarantee. Pay 4999 to UPI: rohit@paytm",
    identifyingPhrases: [
      "BANKNIFTY",
      "100% accurate",
      "premium group",
      "profit guarantee",
      "@paytm",
    ],
    payloadType: "money-transfer",
    severity: "high",
  },
  {
    patternName: "telegram-tipster-stockguru",
    category: "investment-scheme",
    language: "en-IN",
    representativeText:
      "🚨 SEBI Registered Tip 🚨 Buy RELIANCE at 2840, Target 3100, SL 2790. Last 5 calls all hit. DM admin for VIP. ₹8,999/month.",
    identifyingPhrases: [
      "SEBI Registered Tip",
      "VIP",
      "DM admin",
      "all hit",
    ],
    payloadType: "money-transfer",
    severity: "high",
    notes: "Real SEBI-registered advisors don't post tips on public Telegram channels.",
  },

  // ---------- JOB FRAUD ----------
  {
    patternName: "job-fraud-amazon-wfh",
    category: "job-fraud",
    language: "hi-IN",
    representativeText:
      "Amazon Work From Home: 2 ghante kaam, daily ₹2,500-5,000 kamai. Registration fee ₹599 (refundable). Apply: amazon-jobs-wfh.in",
    identifyingPhrases: [
      "Amazon Work From Home",
      "registration fee",
      "refundable",
      "amazon-jobs-wfh.in",
    ],
    payloadType: "money-transfer",
    severity: "medium",
  },

  // ---------- ROMANCE / SOCIAL ----------
  {
    patternName: "romance-emergency-foreign",
    category: "romance-scam",
    language: "en-IN",
    representativeText:
      "My darling I am stuck at customs in Frankfurt with our gift package. They need 1,250 USD clearance fee. I will repay double once I reach Mumbai. Please send urgently.",
    identifyingPhrases: [
      "stuck at customs",
      "clearance fee",
      "I will repay double",
      "send urgently",
    ],
    payloadType: "money-transfer",
    severity: "medium",
  },

  // ---------- TECH SUPPORT ----------
  {
    patternName: "tech-support-microsoft",
    category: "tech-support-fraud",
    language: "hi-IN",
    representativeText:
      "Microsoft Security: Aapke computer mein virus detected. Turant call karein 1800-XXX-XXXX, warna data delete ho jaayega.",
    identifyingPhrases: [
      "Microsoft Security",
      "virus detected",
      "data delete",
      "1800-",
    ],
    payloadType: "credential-harvest",
    severity: "high",
  },

  // ---------- COURIER CUSTOMS ----------
  {
    patternName: "courier-fedex-customs",
    category: "courier-scam",
    language: "en-IN",
    representativeText:
      "FedEx: Your parcel containing illegal items has been seized by Mumbai customs. To avoid legal action, contact officer Sharma at +91-XXXX. Reference: FX-87123.",
    identifyingPhrases: [
      "FedEx",
      "illegal items",
      "Mumbai customs",
      "officer Sharma",
      "Reference: FX-",
    ],
    payloadType: "money-transfer",
    severity: "high",
  },

  // ---------- FAKE REFUND ----------
  {
    patternName: "fake-refund-amazon",
    category: "fake-refund",
    language: "hi-IN",
    representativeText:
      "Amazon: Aapke last order ka refund ₹2,499 process nahi hua. Yahan click karein update bank: amazon.refund-helpdesk.in",
    identifyingPhrases: [
      "Amazon",
      "refund process nahi",
      "amazon.refund-helpdesk.in",
      "update bank",
    ],
    payloadType: "credential-harvest",
    severity: "medium",
  },

  // ---------- KYC UPDATE ----------
  {
    patternName: "kyc-paytm-wallet",
    category: "kyc-update",
    language: "hi-IN",
    representativeText:
      "Paytm: Aapka wallet 24 ghante mein band ho jayega. KYC update karein: paytm-kyc-verify.in — RBI guidelines ke under.",
    identifyingPhrases: [
      "wallet band",
      "paytm-kyc-verify.in",
      "RBI guidelines",
    ],
    payloadType: "credential-harvest",
    severity: "high",
  },

  // ---------- PHISHING LINKS ----------
  {
    patternName: "phishing-icici-imobile",
    category: "phishing-link",
    language: "hi-IN",
    representativeText:
      "ICICI Bank: iMobile app suspended due to security. Reactivate: icici-secure.online/login",
    identifyingPhrases: ["iMobile app suspended", "icici-secure.online", "Reactivate"],
    payloadType: "credential-harvest",
    severity: "high",
  },

  // ---------- ULIP MIS-SELLING ----------
  {
    patternName: "ulip-bank-rm-pitch",
    category: "ulip-misselling",
    language: "hi-IN",
    representativeText:
      "Madam, yeh ek wealth + insurance plan hai. 50,000 saalana, 5 saal lock-in, 10 saal mein guaranteed double + life cover 5 lakh. Bank ka special offer hai aapke liye.",
    identifyingPhrases: [
      "wealth + insurance",
      "lock-in",
      "guaranteed double",
      "special offer",
      "life cover",
    ],
    payloadType: "premium-product",
    severity: "medium",
    notes: "Mis-selling, not strictly criminal — but our Document Audit flow exposes the real fees.",
  },

  // ---------- AEPS / AADHAAR ENABLED PAYMENT SYSTEM CLONING ----------
  {
    patternName: "aeps-aadhaar-biometric-clone",
    category: "aeps-fraud",
    language: "hi-IN",
    representativeText:
      "Sarkari yojana ke liye Aadhaar biometric verification chahiye. Apna right thumb sensor pe rakhein. Free ration + 5000 ka direct benefit transfer mil jayega.",
    identifyingPhrases: [
      "Aadhaar biometric",
      "right thumb",
      "sensor pe rakhein",
      "direct benefit transfer",
      "free ration",
    ],
    payloadType: "biometric-harvest",
    severity: "high",
    notes:
      "AePS cloning — fraudster lifts thumbprint via cheap fingerprint reader, withdraws money from victim's bank account silently. Lock biometric on UIDAI portal.",
  },

  // ---------- SIM SWAP ----------
  {
    patternName: "sim-swap-jio-upgrade",
    category: "sim-swap",
    language: "hi-IN",
    representativeText:
      "Jio: Aapka 4G SIM purana hai. Free 5G upgrade ke liye yeh code dial karein: *401*9XXXXXXXXX#. Network 30 minute mein migrate ho jayega.",
    identifyingPhrases: ["5G upgrade", "*401*", "SIM purana", "migrate ho jayega", "free 5G"],
    payloadType: "call-forward",
    severity: "high",
    notes:
      "*401* + 10-digit number forwards all incoming calls (including OTPs) to the attacker's phone. Never dial unknown USSD codes.",
  },

  // ---------- QUISHING / QR PHISHING ----------
  {
    patternName: "quishing-upi-receive-instead-of-pay",
    category: "qr-phishing",
    language: "hi-IN",
    representativeText:
      "OLX par bike khareedne ke liye 5,000 token amount bhejna hai? Mein army officer hoon, transfer ke liye bas yeh QR scan karke approve karein.",
    identifyingPhrases: ["army officer", "OLX", "QR scan", "approve karein", "token amount"],
    payloadType: "money-transfer",
    severity: "high",
    notes:
      "Classic OLX/Quikr army officer scam: QR code is a UPI 'collect' request — scanning + entering PIN debits the victim, not credits. UPI never asks for PIN to receive money.",
  },

  // ---------- REMOTE-ACCESS APP (AnyDesk / TeamViewer) ----------
  {
    patternName: "remote-access-anydesk-bank",
    category: "remote-access-fraud",
    language: "hi-IN",
    representativeText:
      "HDFC customer care bol raha hoon. Aapke account mein ek suspicious transaction hai. Hum aapki screen guide karenge — Play Store se 'AnyDesk' install karein aur 9-digit code share karein.",
    identifyingPhrases: ["AnyDesk", "TeamViewer", "9-digit code", "screen guide", "suspicious transaction"],
    payloadType: "session-hijack",
    severity: "high",
    notes:
      "RBI/banks NEVER ask customers to install screen-sharing apps. Once installed + code shared, attacker controls the phone end-to-end.",
  },

  // ---------- E-CHALLAN / PARKING / VAHAN ----------
  {
    patternName: "echallan-parivahan-link",
    category: "vahan-phishing",
    language: "en-IN",
    representativeText:
      "Parivahan: Your vehicle MH02XX1234 has a pending challan of ₹1,500 from Bandra. Pay within 24 hrs to avoid 2x penalty: parivahan-echallan.in/pay",
    identifyingPhrases: ["pending challan", "parivahan-echallan.in", "Bandra", "2x penalty", "vehicle MH"],
    payloadType: "credential-harvest",
    severity: "medium",
    notes:
      "Real e-challan portal is echallan.parivahan.gov.in — anything else is phishing. Often paired with fake 'Vahan' app downloads on WhatsApp.",
  },
  {
    patternName: "echallan-vahan-apk",
    category: "vahan-phishing",
    language: "hi-IN",
    representativeText:
      "Traffic Police: Aapke vehicle ka challan kat gaya hai. Detail check karne ke liye yeh Vahan app download karein: bit.ly/vahan-app-check",
    identifyingPhrases: ["Traffic Police", "Vahan app download", "bit.ly", "challan kat"],
    payloadType: "malware-apk",
    severity: "high",
    notes:
      "APK installs banking trojan that intercepts SMS OTPs. Government apps are only on Play Store, never via SMS link.",
  },

  // ---------- FASTAG ----------
  {
    patternName: "fastag-paytm-recharge",
    category: "fastag-scam",
    language: "hi-IN",
    representativeText:
      "Paytm FASTag: Aapka FASTag balance kam hai. Recharge ₹500 free wallet bonus ke saath: fastag-paytm.in/refill",
    identifyingPhrases: ["FASTag balance", "fastag-paytm.in", "free wallet bonus", "recharge"],
    payloadType: "credential-harvest",
    severity: "medium",
  },

  // ---------- LOAN APP HARASSMENT ----------
  {
    patternName: "loan-app-photo-morph",
    category: "loan-app-harassment",
    language: "hi-IN",
    representativeText:
      "Aapne 'CashRupee' app se 5000 liya tha. Aaj 8500 wapis karein warna aapki photo morph karke saare contacts ko bhej dunga.",
    identifyingPhrases: ["CashRupee", "photo morph", "saare contacts", "wapis karein", "warna"],
    payloadType: "extortion",
    severity: "high",
    notes:
      "Predatory Chinese loan apps (since-banned but still circulating). Borrower data + contact list extracted at install. Report to RBI Sachet + cyber crime portal.",
  },

  // ---------- SEXTORTION VIDEO CALL ----------
  {
    patternName: "sextortion-whatsapp-video",
    category: "sextortion",
    language: "hi-IN",
    representativeText:
      "Maine aapki video call record kar li hai. 50,000 deni hogi warna saare Facebook friends + family ko bhej dunga. UPI: revenge.dev@oksbi",
    identifyingPhrases: ["video call record", "Facebook friends", "warna bhej dunga", "@oksbi", "50000"],
    payloadType: "extortion",
    severity: "high",
    notes:
      "Frequently triggered by accidental WhatsApp video pickup from unknown number. Block, screenshot, file at cybercrime.gov.in. Do not pay — first payment never the last.",
  },

  // ---------- MATRIMONY / ROMANCE ----------
  {
    patternName: "matrimony-doctor-uk",
    category: "romance-scam",
    language: "en-IN",
    representativeText:
      "Hi I am Dr. Karan Mehra working at NHS London. I saw your Shaadi.com profile, very impressed. I am visiting Mumbai next month, sending gift package via DHL. Customs may ask for clearance fee around 25,000 INR.",
    identifyingPhrases: ["NHS London", "Shaadi.com", "DHL", "customs", "clearance fee", "gift package"],
    payloadType: "money-transfer",
    severity: "medium",
  },

  // ---------- INVESTMENT SCHEME — STOCK PUMP ----------
  {
    patternName: "stock-pump-whatsapp-group",
    category: "investment-scheme",
    language: "en-IN",
    representativeText:
      "🚀 RELIANCE Industries — confidential merger news! Buy below 2950, target 3450 within 5 trading days. Mehta & Co Wealth — VIP signal #142. Reply YES for tomorrow's call.",
    identifyingPhrases: ["confidential merger news", "VIP signal", "Mehta & Co Wealth", "🚀 RELIANCE", "reply YES"],
    payloadType: "money-transfer",
    severity: "high",
    notes:
      "Pump-and-dump operation. Group operators buy a small-cap, hype it on Telegram/WhatsApp groups, dump on retail buyers. SEBI active enforcement zone.",
  },

  // ---------- INVESTMENT SCHEME — CRYPTO ----------
  {
    patternName: "crypto-arbitrage-deposit",
    category: "investment-scheme",
    language: "en-IN",
    representativeText:
      "BTC arbitrage opportunity — 12% daily returns guaranteed. Minimum deposit ₹10,000. Withdraw any time. Indian users only, KYC done. App: bharatcrypto.app",
    identifyingPhrases: ["12% daily returns", "BTC arbitrage", "guaranteed", "withdraw any time", "bharatcrypto.app"],
    payloadType: "money-transfer",
    severity: "high",
    notes:
      "Ponzi scheme template. RBI hasn't regulated crypto for retail; any 'guaranteed' return is fraud. Long-term losses run into ₹100s of crores per scheme.",
  },

  // ---------- LIC / INSURANCE LAPSE ----------
  {
    patternName: "lic-policy-lapse-call",
    category: "insurance-impersonation",
    language: "hi-IN",
    representativeText:
      "LIC Mumbai branch se Sharma bol raha hoon. Aapki policy 30 din mein lapse ho jayegi. 4500 ka premium turant jama karein. UPI: licrenewal@upi",
    identifyingPhrases: ["LIC Mumbai", "policy lapse", "premium turant", "licrenewal@upi", "30 din mein"],
    payloadType: "money-transfer",
    severity: "high",
    notes: "LIC always sends premium reminders by post + their official mobile app, never via personal UPI handles.",
  },

  // ---------- EPFO ----------
  {
    patternName: "epfo-claim-pf-withdraw",
    category: "epfo-phishing",
    language: "hi-IN",
    representativeText:
      "EPFO: Aapka PF claim approve ho gaya hai ₹1,84,500. Yahan UAN verify karein 24 ghante mein: epfo-claim-status.in",
    identifyingPhrases: ["PF claim approve", "UAN verify", "epfo-claim-status.in", "EPFO"],
    payloadType: "credential-harvest",
    severity: "high",
  },

  // ---------- GST REFUND ----------
  {
    patternName: "gst-refund-cbic",
    category: "tax-refund",
    language: "en-IN",
    representativeText:
      "CBIC: Your GST refund of ₹47,840 is approved. Verify GSTIN at gst-refund-portal.in within 48 hours to credit account.",
    identifyingPhrases: ["GST refund", "GSTIN verify", "gst-refund-portal.in", "CBIC", "credit account"],
    payloadType: "credential-harvest",
    severity: "medium",
  },

  // ---------- POLICE VERIFICATION (LANDLORDS) ----------
  {
    patternName: "police-verification-tenant",
    category: "police-impersonation",
    language: "hi-IN",
    representativeText:
      "Bandra Police Station: Aapke tenant ki police verification pending hai. ₹500 challan jama karein warna FIR hogi. UPI: bandrapolice@paytm",
    identifyingPhrases: ["tenant police verification", "challan jama", "warna FIR", "bandrapolice@paytm"],
    payloadType: "money-transfer",
    severity: "medium",
    notes: "Police never collect fees on personal UPI handles. Tenant verification is free + done at the station.",
  },

  // ---------- COURIER / IFSO IMPERSONATION ----------
  {
    patternName: "courier-cbi-narcotics-bridge",
    category: "digital-arrest",
    language: "en-IN",
    representativeText:
      "FedEx + Mumbai Narcotics Bureau: Your parcel from Iran contains 250g MDMA. Connecting you to IFSO Officer Singh on Skype. Stay on camera till investigation completes.",
    identifyingPhrases: ["FedEx", "Narcotics Bureau", "MDMA", "IFSO Officer", "Skype", "stay on camera"],
    payloadType: "money-transfer",
    severity: "high",
    notes:
      "Two-stage: courier scam transitions to digital arrest. Victim is kept on Skype/video for hours, intimidated into transferring entire savings to 'RBI verification account'.",
  },

  // ---------- DEEPFAKE CEO ----------
  {
    patternName: "deepfake-ceo-urgent-transfer",
    category: "executive-impersonation",
    language: "en-IN",
    representativeText:
      "Hi this is your CEO. I'm in a board meeting and need an urgent ₹4 lakh wire transfer to a new vendor. Can't take calls. Confirm here and I'll send IFSC.",
    identifyingPhrases: ["this is your CEO", "urgent wire transfer", "can't take calls", "board meeting"],
    payloadType: "money-transfer",
    severity: "high",
    notes: "BEC + voice deepfake hybrid. Verify on a known-good channel (in-person, official phone) before any transfer.",
  },

  // ---------- WHATSAPP GREEN TICK ----------
  {
    patternName: "whatsapp-green-tick-verify",
    category: "platform-impersonation",
    language: "en-IN",
    representativeText:
      "WhatsApp Business: Apply for the green tick verification badge. Free for first 100 applicants. Verify at whatsapp-greentick.com",
    identifyingPhrases: ["green tick verification", "WhatsApp Business", "whatsapp-greentick.com", "first 100"],
    payloadType: "credential-harvest",
    severity: "medium",
  },

  // ---------- WHATSAPP CLONE / OTP REQUEST ----------
  {
    patternName: "whatsapp-otp-friend-clone",
    category: "account-takeover",
    language: "hi-IN",
    representativeText:
      "Bhai galti se mera WhatsApp tere number pe register ho gaya. Ek 6-digit code aaya hoga, please bhej de — abhi.",
    identifyingPhrases: ["galti se", "6-digit code", "abhi", "WhatsApp register"],
    payloadType: "session-hijack",
    severity: "high",
    notes:
      "Account takeover: attacker triggers WhatsApp registration on victim's number, asks the victim for the OTP. Once received, owns the account + contacts.",
  },

  // ---------- FAKE DELIVERY OTP ----------
  {
    patternName: "delivery-cancel-otp",
    category: "courier-scam",
    language: "hi-IN",
    representativeText:
      "Flipkart delivery cancel ho rahi hai aapke address pe. Cancel rokne ke liye OTP confirm karein jo abhi aaya hai SMS pe.",
    identifyingPhrases: ["delivery cancel", "OTP confirm", "Flipkart", "address pe", "SMS pe"],
    payloadType: "otp-harvest",
    severity: "high",
    notes:
      "Delivery agent scam: scammer initiates a UPI debit / OTP-based reset, asks victim for the OTP to 'cancel cancellation'.",
  },

  // ---------- FAKE BANK CALLS — CARD BLOCK ----------
  {
    patternName: "card-block-cvv-request",
    category: "banking-impersonation",
    language: "hi-IN",
    representativeText:
      "ICICI Bank fraud team. Aapke debit card pe Mumbai mein 18,500 ka transaction try hua hai. Card block karne ke liye 16-digit number aur back ke 3-digit CVV confirm karein.",
    identifyingPhrases: ["fraud team", "card block", "16-digit", "CVV", "transaction try hua"],
    payloadType: "credential-harvest",
    severity: "high",
    notes: "Banks NEVER ask for full card number + CVV on a call. Hang up, call the number on the back of the card directly.",
  },

  // ---------- SBI YONO PIN RESET ----------
  {
    patternName: "yono-app-pin-reset",
    category: "banking-impersonation",
    language: "hi-IN",
    representativeText:
      "SBI YONO: Aapke account pe naya device login hua hai. Block karne ke liye yahan PIN reset karein: yono-sbi-secure.com/reset",
    identifyingPhrases: ["YONO", "naya device login", "yono-sbi-secure.com", "PIN reset"],
    payloadType: "credential-harvest",
    severity: "high",
  },

  // ---------- INTERNATIONAL WHATSAPP CALL ----------
  {
    patternName: "international-whatsapp-+880",
    category: "social-engineering",
    language: "en-IN",
    representativeText:
      "+880 1XXX XXXXXX — Job at Amazon Bangalore. WhatsApp call missed call back, 35,000/month, work from home. Reply Yes to start.",
    identifyingPhrases: ["+880", "+44", "+62", "WhatsApp missed call", "work from home", "reply Yes"],
    payloadType: "task-fraud",
    severity: "high",
    notes:
      "Bangladesh / Indonesia / Kenya VoIP numbers (+880, +62, +254) used for task-fraud onboarding (rate-this-video, deposit-and-double). 100% scam template.",
  },

  // ---------- TASK FRAUD ----------
  {
    patternName: "task-fraud-youtube-rate",
    category: "task-fraud",
    language: "hi-IN",
    representativeText:
      "YouTube videos like karne ka task — daily 1500-3000 kamai. Pehle 5 task free karein, baad mein deposit karke double karein. Telegram pe join karein: t.me/easytask_in",
    identifyingPhrases: ["YouTube videos like", "task", "telegram join", "deposit karke double", "free karein"],
    payloadType: "money-transfer",
    severity: "high",
    notes:
      "Classic crypto-style task fraud — small initial 'wins' lure victims to deposit, then 'system error' freezes withdrawal. Recovery requires more deposits, ad infinitum.",
  },

  // ---------- AADHAAR-PAN LINK DEADLINE ----------
  {
    patternName: "aadhaar-pan-link-deadline",
    category: "kyc-update",
    language: "hi-IN",
    representativeText:
      "Income Tax: Aadhaar-PAN link aaj last day. Link nahi kiya to PAN inactive ho jayega + 10,000 fine. Yahan link karein: aadhaar-pan-link.in",
    identifyingPhrases: ["Aadhaar-PAN link", "aaj last day", "PAN inactive", "aadhaar-pan-link.in", "10,000 fine"],
    payloadType: "credential-harvest",
    severity: "medium",
    notes: "Real link is incometax.gov.in — anything else is phishing.",
  },

  // ---------- RBI / SBI APP IMPERSONATION ----------
  {
    patternName: "rbi-mahalaxmi-grant",
    category: "government-scheme",
    language: "hi-IN",
    representativeText:
      "RBI Mahalaxmi Yojana: Aapko ₹15,000 grant approved hai. Application status check karein: rbi-mahalaxmi-yojana.in",
    identifyingPhrases: ["RBI Mahalaxmi", "grant approved", "rbi-mahalaxmi-yojana.in", "Yojana"],
    payloadType: "credential-harvest",
    severity: "medium",
    notes: "RBI does not run citizen welfare schemes. Real GoI schemes are on india.gov.in + only via verified DBT.",
  },

  // ---------- PM-KISAN ----------
  {
    patternName: "pm-kisan-registration",
    category: "government-scheme",
    language: "hi-IN",
    representativeText:
      "PM-Kisan: Aapki ₹6000 ki kisht ruki hai. Registration update karein 24 hrs mein: pmkisan-registration.com",
    identifyingPhrases: ["PM-Kisan", "kisht ruki", "registration update", "pmkisan-registration.com"],
    payloadType: "credential-harvest",
    severity: "medium",
  },

  // ---------- INSURANCE CLAIM (HEALTH) ----------
  {
    patternName: "health-insurance-claim-rejected",
    category: "insurance-impersonation",
    language: "hi-IN",
    representativeText:
      "Star Health: Aapka claim 84,500 reject ho gaya hai. Re-submission ke liye sundried documents WhatsApp karein +91 9XXXXXXXXX (Manager Sharma).",
    identifyingPhrases: ["claim reject", "re-submission", "sundried documents", "Manager Sharma"],
    payloadType: "document-harvest",
    severity: "medium",
  },

  // ---------- SCHOOL / COLLEGE FEE ----------
  {
    patternName: "school-fee-headmaster-whatsapp",
    category: "social-engineering",
    language: "en-IN",
    representativeText:
      "This is your child's class teacher. Annual sports day, urgent contribution of ₹3500. Pay to school's UPI: school.fund@ybl. Will send receipt tomorrow.",
    identifyingPhrases: ["class teacher", "sports day", "urgent contribution", "school.fund@ybl", "receipt tomorrow"],
    payloadType: "money-transfer",
    severity: "medium",
    notes: "Fast-spreading variant — number profile usually has school logo as DP. Verify in person before paying.",
  },

  // ---------- AMBULANCE / MEDICAL EMERGENCY ----------
  {
    patternName: "medical-emergency-relative",
    category: "social-engineering",
    language: "hi-IN",
    representativeText:
      "Madam, aapke bhaiya ka accident ho gaya hai Apollo Hospital mein. ICU mein hain. Operation ke liye ₹40,000 turant chahiye. Doctor: +91 9XXXXXXXXX",
    identifyingPhrases: ["accident ho gaya", "Apollo Hospital", "ICU", "operation", "turant chahiye"],
    payloadType: "money-transfer",
    severity: "high",
  },

  // ---------- ARMED FORCES / OLX ----------
  {
    patternName: "olx-army-furniture",
    category: "marketplace-fraud",
    language: "en-IN",
    representativeText:
      "Sir/madam I am Major Vikram, posted at Pathankot. Selling sofa for ₹8,000 due to transfer. Send token via UPI, my logistics team will deliver. ID card attached.",
    identifyingPhrases: ["Major", "posted at", "transfer", "token via UPI", "ID card attached"],
    payloadType: "money-transfer",
    severity: "high",
    notes: "Variants on OLX/Quikr/FB Marketplace. Real armed forces personnel are not allowed to sell on classifieds.",
  },

  // ---------- WhatsApp Pay-to-View / Adult Content ----------
  {
    patternName: "adult-content-link-click-fraud",
    category: "malvertising",
    language: "en-IN",
    representativeText:
      "Hot girls in your area waiting tonight. Free first chat. Click: badanya-girls.in (18+).",
    identifyingPhrases: ["hot girls", "free first chat", "18+", ".in", "tonight"],
    payloadType: "subscription-trap",
    severity: "low",
    notes: "Auto-subscribes carrier billing or installs adware. Enable VAS opt-in lock with carrier.",
  },

  // ---------- INVESTMENT — REVERSE / RECOVERY SCAM ----------
  {
    patternName: "recovery-scam-cyber-cell",
    category: "recovery-scam",
    language: "hi-IN",
    representativeText:
      "Cyber Cell Delhi: Aapne pichle saal jo 80,000 lottery scam mein gaye the, hum recover kar sakte hain. Process fee ₹4,500 advance.",
    identifyingPhrases: ["Cyber Cell", "recover kar sakte", "process fee", "advance", "pichle saal"],
    payloadType: "money-transfer",
    severity: "high",
    notes: "Second-strike: targets prior scam victims by name. Real cybercrime portal never charges fees to file or recover.",
  },
];
