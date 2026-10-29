import { Language, ShopProfile } from '../types';

export interface AISuggestion {
  titleEn: string;
  titleHi: string;
  promptEn: string;
  promptHi: string;
}

export const PRESET_PROMPTS: AISuggestion[] = [
  {
    titleEn: 'Schedule H & H1 Dispensing Rules',
    titleHi: 'शेड्यूल H व H1 दवा नियम',
    promptEn: 'What are the legal Drugs & Cosmetics Act rules for dispensing Schedule H & H1 antibiotics in India?',
    promptHi: 'भारत में शेड्यूल H और H1 एंटीबायोटिक दवाओं की बिक्री के कानूनी नियम और रजिस्टर क्या हैं?',
  },
  {
    titleEn: 'Returning Expired Batches to Distributor',
    titleHi: 'एक्सपायरी दवा डिस्ट्रीब्यूटर को लौटाना',
    promptEn: 'What is the procedure and timeline to return expired medicine batches to wholesale pharma distributors for credit notes?',
    promptHi: 'एक्सपायर हो चुकी दवाएं थोक डिस्ट्रीब्यूटर को वापस करके क्रेडिट नोट लेने का क्या नियम है?',
  },
  {
    titleEn: 'GST & HSN on Medicines (3004 vs 9018)',
    titleHi: 'दवाइयों पर GST दर और HSN कोड',
    promptEn: 'What are the GST rates and HSN codes for allopathic medicines (HSN 3004), diagnostic test strips (9018) and food supplements (2106)?',
    promptHi: 'एलोपैथिक दवाओं (3004), शुगर टेस्ट स्ट्रिप्स (9018) और प्रोटीन सप्लीमेंट्स पर क्या जीएसटी दर है?',
  },
  {
    titleEn: 'Chronic Patient Khata Reminder',
    titleHi: 'मरीज उधार तगादा (व्हाट्सएप संदेश)',
    promptEn: 'Draft a polite WhatsApp payment reminder for a chronic medication patient whose ₹3,200 pharmacy bill is pending.',
    promptHi: 'नियमित मरीज के ₹3,200 मेडिकल बिल के लिए विनम्र व्हाट्सएप तगादा संदेश तैयार करें।',
  },
  {
    titleEn: 'ITC on Wholesale Pharma Purchases',
    titleHi: 'दवा खरीद पर ITC क्लेम नियम',
    promptEn: 'How does a retail chemist claim Input Tax Credit (ITC) in GSTR-3B on wholesale medicine purchases from pharma stockists?',
    promptHi: 'मेडिकल स्टोर संचालक थोक दवा खरीद पर GSTR-3B में इनपुट टैक्स क्रेडिट (ITC) कैसे क्लेम करें?',
  },
];

/**
 * Intelligent Business Assistant responding with domain-grounded Indian MSME answers
 */
export async function getAIAnswer(
  prompt: string,
  lang: Language,
  shop: ShopProfile
): Promise<string> {
  const query = prompt.toLowerCase().trim();

  // 1. WhatsApp payment reminder
  if (query.includes('whatsapp') || query.includes('reminder') || query.includes('तगादा') || query.includes('उधार') || query.includes('khata')) {
    if (lang === 'hi') {
      return `नमस्ते! आपके ग्राहक के लिए विनम्र व्हाट्सएप तगादा संदेश तैयार है:

---
*आदरणीय ग्राहक जी,*
प्रणाम! 🙏

आशा है आप सकुशल हैं। आपकी प्रिय दुकान *${shop.hindiName || shop.name}* से यह एक विनम्र स्मरण पत्र है। आपके खाते का कुल बकाया बिल विवरण:

📌 *दुकान:* ${shop.name}
📍 *स्थान:* ${shop.city}, ${shop.state}
💰 *बकाया राशि:* ₹ [रकम यहाँ डालें]
💳 *यूपीआई आईडी:* \`${shop.upiVpa || 'merchant@upi'}\`

कृपया नीचे दिए गए लिंक या क्यूआर कोड द्वारा भुगतान करके अपनी खाता बही अपडेट करवा लें। आपकी सुविधा के लिए हम सदैव तत्पर हैं।

धन्यवाद!
*${shop.ownerName}*
📞 ${shop.phone}
---

💡 *स्मार्टजीएसटी टिप:* आप सीधे 'ग्राहक खाता' टैब में जाकर किसी भी ग्राहक के नाम के आगे "Send WhatsApp Reminder" बटन पर क्लिक करके 1-क्लिक में यह संदेश भेज सकते हैं।`;
    } else {
      return `Here is a polite and effective WhatsApp payment reminder for your customer:

---
*Dear Valued Customer,*
Greetings from *${shop.name}*! 🙏

We hope you are having a wonderful week. This is a gentle reminder regarding the outstanding balance on your ledger account:

📌 *Store:* ${shop.name}
📍 *Location:* ${shop.city}, ${shop.state}
💰 *Pending Balance:* ₹ [Enter Amount]
💳 *Instant UPI ID:* \`${shop.upiVpa || 'merchant@upi'}\`

Kindly clear the balance at your earliest convenience via GPay, PhonePe, Paytm or Bank Transfer to keep your credit limit active.

Thank you for your continued patronage!
*${shop.ownerName}*
📞 ${shop.phone}
---

💡 *SmartGST AI Tip:* You can also click the green WhatsApp icon directly in your **Customer Khata** tab to auto-fill the customer's phone number and exact overdue amount.`;
    }
  }

  // 2. CGST + SGST vs IGST
  if (query.includes('igst') || query.includes('cgst') || query.includes('interstate') || query.includes('intra') || query.includes('नियम') || query.includes('टैक्स')) {
    if (lang === 'hi') {
      return `### 🧾 CGST + SGST बनाम IGST का सरल नियम:

1. **राज्य के भीतर आपूर्ति (Intra-State Supply):**
   - जब आपकी दुकान और ग्राहक दोनों एक ही राज्य में हों।
   - उदाहरण: आपकी दुकान **${shop.state} (${shop.stateCode})** में है और खरीदार भी **${shop.state}** का है।
   - **लागू टैक्स:** जीएसटी दर आधी-आधी बंटती है:
     - 18% की वस्तु पर $\\rightarrow$ **9% CGST** (केंद्र) + **9% SGST** (राज्य)।
     - 5% की वस्तु पर $\\rightarrow$ **2.5% CGST** + **2.5% SGST**।

2. **अंतरराज्यीय आपूर्ति (Inter-State Supply):**
   - जब माल एक राज्य से दूसरे राज्य में बेचा या भेजा जाता है।
   - उदाहरण: आपकी दुकान **${shop.state}** में है और माल उत्तर प्रदेश, बिहार या हरियाणा भेजा जा रहा है।
   - **लागू टैक्स:** पूरा टैक्स केंद्र को जाता है $\\rightarrow$ **18% IGST (Integrated GST)**।

⚡ *स्मार्टजीएसटी AI सुविधा:* हमारे बिल जनरेटर में जैसे ही आप ग्राहक का राज्य चुनते हैं, सिस्टम अपने आप पता लगा लेता है कि CGST+SGST लगेगा या IGST! आपको मैन्युअल हिसाब लगाने की आवश्यकता नहीं है।`;
    } else {
      return `### 🧾 The Clear Rule for CGST + SGST vs IGST:

1. **Intra-State Supply (Within Same State):**
   - When the supplier's location and the Place of Supply (Customer state) are in the **same State**.
   - Example: Your shop is in **${shop.state} (Code: ${shop.stateCode})** and selling to a buyer in **${shop.state}**.
   - **Tax Applicable:** Total GST is divided equally:
     - 18% Item $\\rightarrow$ **9% CGST** (Central) + **9% SGST** (State).
     - 5% Item $\\rightarrow$ **2.5% CGST** + **2.5% SGST**.
     - 12% Item $\\rightarrow$ **6% CGST** + **6% SGST**.

2. **Inter-State Supply (Across State Borders):**
   - When goods move across state boundaries (e.g. from ${shop.state} to another Indian state).
   - **Tax Applicable:** **100% IGST (Integrated GST)** is charged as a single rate (e.g. Full 18% IGST).

⚡ *SmartGST Automation:* In our **New Bill** generator, simply choose the customer's State of Supply, and SmartGST AI automatically switches between CGST+SGST or IGST columns on the tax invoice!`;
    }
  }

  // 3. ITC (Input Tax Credit)
  if (query.includes('itc') || query.includes('input tax') || query.includes('क्रेडिट') || query.includes('छूट')) {
    if (lang === 'hi') {
      return `### 💡 इनपुट टैक्स क्रेडिट (ITC) क्लेम करने की 4 अनिवार्य शर्तें:

धारा 16 (जीएसटी अधिनियम) के अनुसार दुकानदार को खरीद पर दिया गया जीएसटी वापस (क्रेडिट) तभी मिलेगा जब:

1. **मानक टैक्स इनवॉइस:** आपके पास सप्लायर का ओरिजिनल GST Tax Invoice या Debit Note होना चाहिए।
2. **माल की वास्तविक प्राप्ति:** माल या सेवा आपकी दुकान या गोदाम में भौतिक रूप से प्राप्त हो चुकी हो।
3. **GSTR-2B में मिलान:** सप्लायर ने अपनी GSTR-1 में यह बिल अपलोड किया हो और वह आपके जीएसटी पोर्टल के **GSTR-2B** में दिख रहा हो।
4. **180 दिनों में भुगतान:** आपने सप्लायर को 180 दिनों के भीतर बिल व टैक्स की पूरी रकम अदा कर दी हो (अन्यथा ब्याज सहित ITC रिवर्स करना होगा)।

📊 *स्मार्टजीएसटी AI टिप:* हमारे 'सप्लायर व खरीद' मेनू में जब भी आप कोई खरीद बिल दर्ज करते हैं, तो **ITC Eligible** बॉक्स चेक रखें। यह मासिक GSTR-3B रिपोर्ट में आपके टैक्स देनदारी को कम करने का हिसाब तैयार रखता है!`;
    } else {
      return `### 💡 4 Mandatory Rules to Claim Input Tax Credit (ITC):

Under Section 16 of the CGST Act, you can offset the GST you paid on supplier purchases against the GST you collect from customer sales, provided:

1. **Valid Tax Invoice:** You possess a valid GST Tax Invoice or Debit Note with the supplier's GSTIN and HSN code.
2. **Actual Receipt of Goods:** The goods or services have been physically received at your store/warehouse.
3. **GSTR-2B Auto-Reflection:** The supplier has filed their GSTR-1 and the bill appears in your GSTR-2B on the GST Portal.
4. **180-Day Payment Rule:** You must settle the supplier's payment (invoice value + tax) within 180 days of invoice date, otherwise the claimed ITC must be reversed with interest.

📊 *SmartGST AI Automation:* Keep the "ITC Eligible" checkbox marked when recording supplier purchase bills in the **Suppliers & Purchases** tab. Our GST Reports tab automatically computes your Net GST Payable = (Output Tax - ITC).`;
    }
  }

  // 4. Schedule H & H1 Dispensing Regulations
  if (query.includes('schedule') || query.includes('h1') || query.includes('antibiotic') || query.includes('दवा नियम') || query.includes('शेड्यूल')) {
    if (lang === 'hi') {
      return `### 💊 भारत में शेड्यूल H और H1 दवाओं की बिक्री के कानूनी नियम (ड्रग्स एंड कॉस्मेटिक्स एक्ट):

1. **पर्चे की अनिवार्यता (Mandatory Prescription):**
   - शेड्यूल H और H1 दवाएं (जैसे Augmentin, Azithral, Alprazolam) केवल पंजीकृत डॉक्टर (RMP) के मूल पर्चे के आधार पर ही बेची जा सकती हैं।
2. **शेड्यूल H1 अलग रजिस्टर (H1 Dedicated Register):**
   - H1 दवाओं के लिए अलग रजिस्टर रखना अनिवार्य है जिसमें:
     - मरीज का नाम और पता
     - डॉक्टर का नाम और मेडिकल रजिस्ट्रेशन नंबर
     - दवा का नाम, बैच नंबर और मात्रा
     - बिक्री की तारीख
   - यह रजिस्टर कम से कम **3 वर्षों तक सुरक्षित** रखना अनिवार्य है।
3. **कैश मेमो पर अनिवार्य विवरण:**
   - कैश मेमो पर दुकान का ड्रग लाइसेंस नंबर (Form 20B/21B) और पंजीकृत फार्मासिस्ट का नाम अंकित होना चाहिए।
4. **एक्सपायरी दवा बिक्री पर पूर्ण प्रतिबंध:**
   - एक्सपायर हो चुकी किसी भी दवा की बिक्री ड्रग्स एक्ट की धारा 18(a) के तहत संज्ञेय अपराध है।

💡 *स्मार्टजीएसटी AI:* हमारे मेडिकल बिल फॉर्म में 'Schedule H (Rx)' बैच होने पर डॉक्टर का नाम व रजिस्ट्रेशन नंबर भरने का विकल्प स्वतः आ जाता है!`;
    } else {
      return `### 💊 Legal Dispensing Rules for Schedule H & H1 Drugs (Drugs & Cosmetics Act, 1945):

1. **Prescription Requirement:**
   - Schedule H, H1, and Schedule X drugs cannot be sold over-the-counter (OTC). A valid prescription from a Registered Medical Practitioner (RMP) is legally mandatory.
2. **Separate Schedule H1 Register:**
   - Under the 2013 amendment, third and fourth-generation antibiotics (e.g. Cephalosporins, Carbapenems, Fluoroquinolones) and psychotropics require maintaining a separate register recording:
     - Date of supply
     - Name and address of the patient
     - Name and registration number of the prescriber
     - Name of the drug, batch number, and quantity supplied
   - Must be retained for inspection for a minimum of **3 years**.
3. **Retail Cash Memo Essentials:**
   - Retail invoices must carry the retail chemist's Drug License numbers (Form 20B / Form 21B), Registered Pharmacist's credentials, and medicine batch numbers.
4. **Zero Tolerance for Expired Drugs:**
   - Dispensing expired medication attracts penal action under Section 18(a)(v) and Section 27 of the Act. SmartGST automatically locks expired batches from being billed.`;
    }
  }

  // 5. Returning Expired Batches to Pharma Distributor
  if (query.includes('expiry') || query.includes('expired') || query.includes('एक्सपायरी') || query.includes('लौटाना') || query.includes('return')) {
    if (lang === 'hi') {
      return `### 📦 एक्सपायरी दवाओं को थोक डिस्ट्रीब्यूटर को लौटाने का सही तरीका:

1. **90-दिन का प्री-एक्सपायरी नोटिस:**
   - ज्यादातर फार्मा कंपनियां और सीएंडएफ (C&F) एजेंट एक्सपायरी से 60 से 90 दिन पहले या एक्सपायरी के 30 दिनों के भीतर स्टॉक वापस स्वीकार करते हैं।
2. **डेबिट नोट (Debit Note) बनाएं:**
   - हमारे 'सप्लायर व खरीद' टैब में जाकर **"+ Return Expired Batch"** पर क्लिक करें।
   - दवा का नाम, बैच नंबर, एक्सपायरी डेट और खरीद मूल्य दर्ज करके डेबिट नोट जारी करें।
3. **क्रेडिट नोट (Credit Note) प्राप्त करें:**
   - डिस्ट्रीब्यूटर आपकी खाता बही में क्रेडिट नोट जमा करेगा, जिससे आपकी आगामी खरीद में उतनी राशि घट जाएगी।
4. **टैक्स इनवॉइस समायोजन (GST Adjustment):**
   - एक्सपायर्ड स्टॉक लौटाने पर जीएसटी क्रेडिट नोट के माध्यम से आपके GSTR-3B में टैक्स समायोजन भी दर्ज हो जाता है।

💡 *स्मार्टजीएसटी अलर्ट:* डैशबोर्ड में 'Expiring in 30 Days' सूची नियमित देखें ताकि समय रहते डिस्ट्रीब्यूटर से रिफंड या रिप्लेसमेंट लिया जा सके!`;
    } else {
      return `### 📦 Protocol for Returning Expired Medicine Batches to Pharma Distributors:

1. **Return Window & Cut-off:**
   - Most pharmaceutical manufacturers and authorized stockists accept expired batches within 60 to 90 days of expiry date, or under a near-expiry exchange policy.
2. **Issue a Debit Note:**
   - In the **Suppliers & Purchases** tab, click **"+ Return Expired Batch"** to log the return.
   - Enter the product, manufacturer, batch number, expiry date, and credit claim amount.
3. **Distributor Credit Note:**
   - The stockist issues a Credit Note against your trade account, reducing your outstanding payable balance or providing replacement fresh stock.
4. **GST Treatment under Circular No. 72/46/2018-GST:**
   - Expired goods returned can be treated as a supply or adjusted via financial credit note. If goods are destroyed, input tax credit attributable to destroyed goods must be reversed under Section 17(5)(h).

💡 *SmartGST AI Automation:* Keep checking the **Expiry Alerts** banner on your dashboard to initiate returns before distributor policy deadlines expire!`;
    }
  }

  // 6. GST on Medicines & HSN
  if (query.includes('3004') || query.includes('9018') || query.includes('medicine') || query.includes('hsn') || query.includes('दवा')) {
    if (lang === 'hi') {
      return `### 🏥 मेडिकल स्टोर के मुख्य HSN कोड और GST टैक्स स्लैब:

1. **HSN 3004 (12% GST):**
   - सभी सामान्य एलोपैथिक दवाएं, गोलियां, सीरप, कैप्सूल (Augmentin, Dolo, Pan-D, Azithral, आदि)।
   - इंट्रा-स्टेट बिक्री पर: **6% CGST + 6% SGST**
   - इंटर-स्टेट बिक्री पर: **12% IGST**
2. **HSN 3002 (5% GST):**
   - जीवन रक्षक टीके (Vaccines), इंसुलिन, रक्त उत्पाद और क्रिटिकल बायोलॉजिकल इंजेक्शन।
3. **HSN 9018 (18% GST):**
   - मेडिकल उपकरण, ग्लूकोमीटर, ब्लड प्रेशर मॉनिटर, सर्जिकल ग्लव्स और टेस्ट स्ट्रिप्स।
4. **HSN 2106 (18% GST):**
   - प्रोटीन पाउडर, न्यूट्रास्यूटिकल सप्लीमेंट्स, हेल्थ टॉनिक।
5. **HSN 3006 (12% GST):**
   - बंध्य (Sterile) सर्जिकल पट्टियां, टांके और प्राथमिक चिकित्सा सामग्री।`;
    } else {
      return `### 🏥 Core Pharma HSN Codes and GST Slabs in India:

1. **HSN 3004 — Standard Allopathic Medicines (12% GST):**
   - Formulated pharmaceuticals, tablets, capsules, syrups (Paracetamol, Antibiotics, Antihypertensives, Antacids).
   - Local state: **6% CGST + 6% SGST**
   - Interstate: **12% IGST**
2. **HSN 3002 — Critical Vaccines & Life Savers (5% GST):**
   - Vaccines, diagnostic reagents, human blood fractions, and insulin products.
3. **HSN 9018 — Medical Instruments & Test Strips (18% GST):**
   - Blood glucose test strips, digital thermometers, BP monitors, surgical instruments.
4. **HSN 2106 — Nutraceuticals & Dietary Supplements (18% GST):**
   - Protein supplements, multivitamin drinks, and nutritional food preparations.
5. **HSN 3006 — First Aid & Dental Preparations (12% GST):**
   - Sterile surgical catgut, suture materials, first aid boxes, dental cements.`;
    }
  }

  // 7. Default high quality response
  if (lang === 'hi') {
    return `नमस्ते! आपके प्रश्न: "${prompt}" के संबंध में:

आपकी फार्मेसी **${shop.name}** के रिकॉर्ड्स के आधार पर:
- आपकी श्रेणी: **${shop.category}** (ड्रग लाइसेंस: **${shop.dlNumber20B}** | फार्मासिस्ट: **${shop.registeredPharmacist}**)
- राज्य कोड: **${shop.stateCode} - ${shop.state}**
- मेडिकल बिलिंग में दवाओं का बैच नंबर, एक्सपायरी डेट, HSN कोड (3004) और सटीक 12% जीएसटी लगाने से ड्रग्स एक्ट और जीएसटी दोनों का अनुपालन सुनिश्चित रहता है।
- यदि आपको किसी विशेष दवा, एक्सपायरी वापसी, मरीज खाते या टैक्स चालान की जानकारी चाहिए, तो कृपया पूछें।

*स्मार्टजीएसटी AI मित्र आपकी सेवा में सदैव तत्पर है!*`;
  } else {
    return `Hello! Regarding your query: "${prompt}"

For **${shop.name}** (D.L. Form 20B: **${shop.dlNumber20B}**, Pharmacist: **${shop.registeredPharmacist}**):
- Operating with GSTIN: **${shop.gstin}** in **${shop.state} (${shop.stateCode})**.
- Maintaining batch numbers, expiry dates, doctor registration references, and accurate 12% GST (HSN 3004) keeps your pharmacy 100% compliant with both the Drugs & Cosmetics Act and CBIC GST mandates.
- Feel free to ask about Schedule H/H1 registers, expired batch credit returns, patient khata collection messages, or GSTR-1/3B filing procedures!`;
  }
}

