import { QuestionDefinition, SectionMeta } from './types';

export const CLINICAL_SECTIONS: SectionMeta[] = [
  {
    key: 'demographics',
    title: 'BÖLÜM 1: Hasta Demografik ve Temel Klinik Bilgileri',
    subtitle: 'Plazma maruziyetini ve ilaç klerensini etkileyen temel klinik faktörlerin taranması',
    icon: 'fa-id-card-clip',
    badge: 'Bölüm 1'
  },
  {
    key: 'usage_compliance',
    title: 'BÖLÜM 2: Apixaban Kullanım ve Uyum Detayları',
    subtitle: 'Reçete dozu, tedaviye başlama zamanı, ilaç uyumu ve son doz saati',
    icon: 'fa-pills',
    badge: 'Bölüm 2'
  },
  {
    key: 'concomitant_drugs',
    title: 'BÖLÜM 3: Eşzamanlı İlaç Kullanımı ve Etkileşim Taranması',
    subtitle: 'CYP3A4 ve P-glikoprotein yolaklarını etkileyen ilaçlar apixaban seviyesini doğrudan değiştirebilir',
    icon: 'fa-capsules',
    badge: 'Bölüm 3'
  },
  {
    key: 'bleeding_symptoms',
    title: 'BÖLÜM 4: Organ Sistemlerine Göre Kanama Belirtilerinin Taraması',
    subtitle: 'Apixaban tedavisine başladıktan sonra aşağıdaki kanama durumlarından herhangi birini yaşadınız mı?',
    icon: 'fa-droplet',
    badge: 'Bölüm 4'
  },
  {
    key: 'clinical_outcomes',
    title: 'BÖLÜM 5: Kanamanın Şiddeti ve Klinik Sonuçlarının Derecelendirilmesi',
    subtitle: 'ISTH Majör / Klinik Olarak Anlamlı Minör Kanama Sınıflandırması İçin',
    icon: 'fa-hospital',
    badge: 'Bölüm 5'
  },
  {
    key: 'temporal_causality',
    title: 'BÖLÜM 6: Zamansal İlişki (Genotip-PK Korelasyonu İçin)',
    subtitle: 'Tedavi başlangıcı, ilk kanama belirtisi zamanı ve doz alım ilişkisi',
    icon: 'fa-stopwatch',
    badge: 'Bölüm 6'
  }
];

export const INITIAL_QUESTIONS: QuestionDefinition[] = [
  // =================== BÖLÜM 1: DEMOGRAFİK ===================
  {
    id: 'protocolNo',
    section: 'demographics',
    title: 'Hasta TC',
    type: 'text',
    required: true,
    spssVarName: 'TC_NO',
    placeholder: 'Örn: 12345678901'
  },
  {
    id: 'age',
    section: 'demographics',
    title: 'Yaşınız',
    type: 'number',
    required: true,
    spssVarName: 'AGE',
    placeholder: 'Örn: 68'
  },
  {
    id: 'gender',
    section: 'demographics',
    title: 'Cinsiyetiniz',
    description: 'Kadın cinsiyette düzeltilmiş pik plazma konsantrasyonu yüksekliği bildirildiğinden önem arz eder',
    type: 'radio',
    options: ['Kadın', 'Erkek'],
    required: true,
    spssVarName: 'GENDER'
  },
  {
    id: 'weightKg',
    section: 'demographics',
    title: 'Vücut Ağırlığınız (kg)',
    type: 'number',
    required: true,
    spssVarName: 'WEIGHT_KG',
    placeholder: 'Örn: 72'
  },
  {
    id: 'heightCm',
    section: 'demographics',
    title: 'Boyunuz (cm)',
    type: 'number',
    required: false,
    spssVarName: 'HEIGHT_CM',
    placeholder: 'Örn: 170'
  },
  {
    id: 'indication',
    section: 'demographics',
    title: 'Apixaban Kullanım Endikasyonunuz Nedir?',
    type: 'radio',
    options: [
      'Atriyal Fibrilasyon (İnme / sistemik emboli önlenmesi)',
      'Derin Ven Trombozu (DVT) veya Akciğer Embolisi (PE) tedavisi / önlenmesi',
      'Ortopedik cerrahi sonrası tromboz koruması',
      'Diğer'
    ],
    required: true,
    spssVarName: 'INDICATION'
  },

  // =================== BÖLÜM 2: APİXABAN KULLANIM VE UYUM ===================
  {
    id: 'apixabanDose',
    section: 'usage_compliance',
    title: 'Günlük Apixaban Dozunuz Nedir?',
    type: 'radio',
    options: [
      'Günde 2 kez 2.5 mg',
      'Günde 2 kez 5 mg',
      'Diğer'
    ],
    required: true,
    spssVarName: 'APIX_DOSE'
  },
  {
    id: 'treatmentStartDate',
    section: 'usage_compliance',
    title: 'Apixaban Tedavisine Ne Zaman Başladınız? (Tarih / Kaç aydır kullanıyorsunuz?)',
    type: 'text',
    required: true,
    spssVarName: 'START_DATE',
    placeholder: 'Örn: 6 aydır / Ocak 2024'
  },
  {
    id: 'complianceLevel',
    section: 'usage_compliance',
    title: 'İlacınızı Düzenli Alıyor musunuz? (İlaç Uyumu)',
    type: 'radio',
    options: [
      'Her gün zamanında alıyorum',
      'Haftada 1-2 doz unutuyorum',
      'Sık sık doz atlıyorum'
    ],
    required: true,
    spssVarName: 'COMPLIANCE'
  },
  {
    id: 'lastDoseTime',
    section: 'usage_compliance',
    title: 'Son Apixaban Dozunu Saat Kaçta Aldınız?',
    description: 'Kan alma ve plazma konsantrasyon düzeyi tayini için gereklidir',
    type: 'text',
    required: true,
    spssVarName: 'LAST_DOSE_TIME',
    placeholder: 'Örn: 08:30 veya 20:00'
  },

  // =================== BÖLÜM 3: EŞZAMANLI İLAÇLAR ===================
  {
    id: 'otherAnticoagulant',
    section: 'concomitant_drugs',
    title: 'Şu An Düzenli Olarak Kan Sulandırıcı veya Pıhtı Önleyici Başka Bir İlaç Kullanıyor musunuz?',
    type: 'checkbox',
    options: [
      'Aspirin',
      'Klopidogrel / Prasugrel / Tikagrelor',
      'Heparin',
      'Hayır'
    ],
    required: true,
    spssVarName: 'OTHER_ANTICOAG'
  },
  {
    id: 'nsaidUse',
    section: 'concomitant_drugs',
    title: 'Ağrı Kesici / Romatizma İlacı (NSAİİ) Kullanıyor musunuz?',
    description: 'Örn: İbuprofen, Naproksen, Diklofenak vb.',
    type: 'radio',
    options: [
      'Hayır',
      'Evet (Düzenli her gün)',
      'Evet (İhtiyaç halinde / Seyrek)'
    ],
    required: true,
    spssVarName: 'NSAID_USE'
  },
  {
    id: 'cyp3a4PgpInhibitors',
    section: 'concomitant_drugs',
    title: 'Güçlü/Orta CYP3A4 ve P-gp İnhibitörleri (Konsantrasyonu Artıranlar - Son 1 Ay)',
    type: 'checkbox',
    options: [
      'Amiodaron',
      'Verapamil',
      'Diltiazem',
      'Ketokonazol / İtrakonazol',
      'Klaritromisin / Eritromisin',
      'Hiçbiri'
    ],
    required: true,
    spssVarName: 'CYP_INHIB'
  },
  {
    id: 'cyp3a4Inducers',
    section: 'concomitant_drugs',
    title: 'Güçlü Enzim İndükleyicileri (Konsantrasyonu Düşürenler - Son 1 Ay)',
    type: 'checkbox',
    options: [
      'Rifampisin',
      'Karbamazepin',
      'Fenitoin',
      'Sarı Kantaron (St. John\'s Wort)',
      'Hiçbiri'
    ],
    required: true,
    spssVarName: 'CYP_INDUC'
  },

  // =================== BÖLÜM 4: ORGAN SİSTEMLERİNE GÖRE KANAMA ===================
  // A. Cilt ve Yüzeyel / Mukoza Kanamaları
  {
    id: 'skinBruising',
    section: 'bleeding_symptoms',
    title: 'Sebepsiz veya Küçük Çarpmalarla Vücudunuzda Kolayca Morarma / Mor Lekeler (Ekimoz) Oluşuyor mu?',
    description: 'A. Cilt ve Yüzeyel / Mukoza Kanamaları (Minör Kanamalar)',
    type: 'radio',
    options: [
      'Hayır',
      'Evet (Küçük <2 cm)',
      'Evet (Geniş >5 cm)'
    ],
    required: true,
    spssVarName: 'SKIN_BRUISE'
  },
  {
    id: 'gingivalBleeding',
    section: 'bleeding_symptoms',
    title: 'Diş Fırçalarken veya Kendiliğinden Diş Eti Kanamanız Oluyor mu?',
    type: 'radio',
    options: [
      'Hayır',
      'Evet (Süresi <5 dakika)',
      'Evet (Süresi >5 dakika / Zor duruyor)'
    ],
    required: true,
    spssVarName: 'GINGIVAL_BLEED'
  },
  {
    id: 'epistaxis',
    section: 'bleeding_symptoms',
    title: 'Burun Kanaması (Epistaksis) Yaşadınız mı?',
    type: 'radio',
    options: [
      'Hayır',
      'Evet (Ayda 1-2 kez | <10 dk süren)',
      'Evet (Ayda 1-2 kez | >10 dk süren)',
      'Evet (Haftada birkaç kez | <10 dk süren)',
      'Evet (Haftada birkaç kez | >10 dk süren)'
    ],
    required: true,
    spssVarName: 'EPISTAXIS'
  },
  {
    id: 'cutsProlongedBleeding',
    section: 'bleeding_symptoms',
    title: 'Tıraş Olurken veya Küçük Kesiklerde Kanama Normalden Uzun Süreli mi Oluyor?',
    type: 'radio',
    options: [
      'Hayır',
      'Evet'
    ],
    required: true,
    spssVarName: 'CUTS_PROLONGED'
  },

  // B. Gastrointestinal Sistem Kanamaları
  {
    id: 'melena',
    section: 'bleeding_symptoms',
    title: 'Dışkınızın Renginde Siyahlaşma, Katran Gibi Cıvık ve Kötü Kokulu Dışkılama (Melena) Oldu mu?',
    description: 'B. Gastrointestinal Sistem (Sindirim Sistemi) Kanamaları',
    type: 'radio',
    options: [
      'Hayır',
      'Evet'
    ],
    required: true,
    spssVarName: 'MELENA'
  },
  {
    id: 'hematochezia',
    section: 'bleeding_symptoms',
    title: 'Tuvalette Veya Dışkıda Parlak Kırmızı Renkli Taze Kan Gördünüz mü?',
    type: 'radio',
    options: [
      'Hayır',
      'Evet'
    ],
    required: true,
    spssVarName: 'HEMATOCHEZIA'
  },
  {
    id: 'hematemesis',
    section: 'bleeding_symptoms',
    title: 'Kusma İle Birlikte Taze Kan Veya Kahve Telvesine Benzer Siyah Parçacıklar Geldi mi?',
    type: 'radio',
    options: [
      'Hayır',
      'Evet'
    ],
    required: true,
    spssVarName: 'HEMATEMESIS'
  },

  // C. Ürogenital Sistem Kanamaları
  {
    id: 'hematuria',
    section: 'bleeding_symptoms',
    title: 'İdrar Renginizde Pembe, Kırmızı Veya Çay Rengi/Kahverengi Değişme (Hematüri) Oldu mu?',
    description: 'C. Ürogenital Sistem Kanamaları',
    type: 'radio',
    options: [
      'Hayır',
      'Evet'
    ],
    required: true,
    spssVarName: 'HEMATURIA'
  },
  {
    id: 'menorrhagia',
    section: 'bleeding_symptoms',
    title: '(Kadın Hastalar İçin) Adet Kanamalarınızda Belirgin Artış, Miktarında Fazlalaşma veya Pıhtılı/Uzun Süren Adet Dönemi Oldu mu?',
    type: 'radio',
    options: [
      'Hayır',
      'Evet',
      'Menopozda / Uygulanamaz'
    ],
    required: true,
    spssVarName: 'MENORRHAGIA'
  },

  // D. Santral Sinir Sistemi / Nörolojik Belirtiler
  {
    id: 'severeHeadache',
    section: 'bleeding_symptoms',
    title: 'Aniden Başlayan, Hayatınızda Yaşadığınız En Şiddetli Baş Ağrısı Oldu mu?',
    description: 'D. Santral Sinir Sistemi / Nörolojik Belirtiler (Şiddetli / Majör Kanama Şüphesi)',
    type: 'radio',
    options: [
      'Hayır',
      'Evet'
    ],
    required: true,
    spssVarName: 'SEVERE_HEADACHE'
  },
  {
    id: 'neurologicalSymptoms',
    section: 'bleeding_symptoms',
    title: 'Son Zamanlarda Ani Baş Dönmesi, Görme Bozukluğu, Konuşmada Güçlük Veya Yüzde/Kolda Uyuşma/Güçsüzlük Hissettiniz mi?',
    type: 'radio',
    options: [
      'Hayır',
      'Evet'
    ],
    required: true,
    spssVarName: 'NEURO_SYMPTOM'
  },

  // E. Kas, Eklem ve Derin Doku Kanamaları
  {
    id: 'hemarthrosis',
    section: 'bleeding_symptoms',
    title: 'Darbe Almadan Eklem Yerlerinizde (Diz, Dirsek vb.) Ani Şişlik, Kızarıklık ve Şiddetli Ağrı (Hemartroz) Oldu mu?',
    description: 'E. Kas, Eklem ve Derin Doku Kanamaları',
    type: 'radio',
    options: [
      'Hayır',
      'Evet'
    ],
    required: true,
    spssVarName: 'HEMARTHROSIS'
  },
  {
    id: 'hemoptysis',
    section: 'bleeding_symptoms',
    title: 'Öksürükle Birlikte Ağzınızdan Kan Veya Kanlı Balgam Geldi mi (Hemoptizi)?',
    type: 'radio',
    options: [
      'Hayır',
      'Evet'
    ],
    required: true,
    spssVarName: 'HEMOPTYSIS'
  },
  {
    id: 'ocularBleeding',
    section: 'bleeding_symptoms',
    title: 'Göz İçinde Kan Oturması / Belirgin Kızarıklık Yaşadınız mı?',
    type: 'radio',
    options: [
      'Hayır',
      'Evet'
    ],
    required: true,
    spssVarName: 'OCULAR_BLEED'
  },

  // =================== BÖLÜM 5: KANAMA ŞİDDETİ VE SONUÇLAR ===================
  {
    id: 'hospitalVisit',
    section: 'clinical_outcomes',
    title: 'Yaşadığınız Kanama Nedeniyle Bir Sağlık Kuruluşuna / Acil Servise Başvurdunuz mu?',
    type: 'radio',
    options: [
      'Hayır',
      'Evet (Poliklinik başvurusu)',
      'Evet (Acil Servis başvurusu)',
      'Evet (Hastaneye yatış yapıldı)'
    ],
    required: true,
    spssVarName: 'HOSP_VISIT'
  },
  {
    id: 'transfusionReceived',
    section: 'clinical_outcomes',
    title: 'Kanama Sonrasında Size Kan Transfüzyonu (Kan Verilmesi) Yapıldı mı?',
    type: 'radio',
    options: [
      'Hayır',
      'Evet (1 Ünite)',
      'Evet (2 Ünite)',
      'Evet (≥3 Ünite)'
    ],
    required: true,
    spssVarName: 'TRANSFUSION'
  },
  {
    id: 'treatmentInterruption',
    section: 'clinical_outcomes',
    title: 'Kanama Nedeniyle Apixaban Tedavinize Geçici veya Kalıcı Olarak Ara Verildi mi / Kesildi mi?',
    type: 'radio',
    options: [
      'Hayır',
      'Evet (1-3 gün ara verildi)',
      'Evet (4-7 gün ara verildi)',
      'Evet (>7 gün ara verildi veya kalıcı kesildi)'
    ],
    required: true,
    spssVarName: 'TREAT_INTERRUPT'
  },
  {
    id: 'hbDrop',
    section: 'clinical_outcomes',
    title: 'Kanama Sonrası Hemoglobin Değerinizde Belirgin Bir Düşüş (>2 g/dL) Olduğu Söylendi mi?',
    type: 'radio',
    options: [
      'Hayır',
      'Evet',
      'Ölçülmedi / Bilinmiyor'
    ],
    required: true,
    spssVarName: 'HB_DROP'
  },

  // =================== BÖLÜM 6: ZAMANSAL İLİŞKİ ===================
  {
    id: 'bleedingOnsetTime',
    section: 'temporal_causality',
    title: 'Şayet Kanama Yaşadıysanız, İlk Kanama Belirtisi Apixaban Başlandıktan Kaç Gün / Hafta Sonra Ortaya Çıktı?',
    type: 'text',
    required: true,
    spssVarName: 'ONSET_TIME',
    placeholder: 'Örn: 2 hafta sonra / 15 gün sonra / Kanama olmadı'
  },
  {
    id: 'doseTimingOnBleedingDay',
    section: 'temporal_causality',
    title: 'Kanamanın Olduğu Gün İlacınızı Normal Dozunda ve Saatinde Almış mıydınız?',
    type: 'radio',
    options: [
      'Evet',
      'Unutup çift doz almıştım',
      'İlacı aldıktan hemen sonra kanama oldu',
      'Kanama yaşanmadı / Uygulanamaz'
    ],
    required: true,
    spssVarName: 'DOSE_TIMING_DAY'
  }
];
