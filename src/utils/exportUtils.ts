import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PatientRecord } from '../firebase';
import { QuestionDefinition } from '../types';

export const getFormattedTimestamp = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 1. EXCEL (.xlsx) EXPORT
export const exportToExcel = (patients: PatientRecord[], questions: QuestionDefinition[]) => {
  if (!patients.length) {
    alert('Dışa aktarılacak kayıt bulunamadı.');
    return;
  }

  const data = patients.map((p, index) => {
    const row: Record<string, any> = {
      'Sıra No': index + 1,
      'Hasta Protokol / ID No': p.protocolNo || '',
      'Kayıt Tarihi': p.createdAt ? new Date(p.createdAt).toLocaleDateString('tr-TR') : '',
      'Yaş': p.age || '',
      'Cinsiyet': p.gender || '',
      'Vücut Ağırlığı (kg)': p.weightKg || '',
      'Boy (cm)': p.heightCm || '',
      'Endikasyon': p.indication || '',
      'Serum Kreatinin (mg/dL)': p.serumCreatinine || '',
      'CrCl (mL/dk)': p.crCl || '',
      'ALT / AST (IU/L)': p.altAst || '',
      'Hemoglobin (Hb, g/dL)': p.hbValue || '',
      'Günlük Apixaban Dozu': p.apixabanDose || '',
      'Tedavi Başlama / Süre': p.treatmentStartDate || '',
      'İlaç Uyumu': p.complianceLevel || '',
      'Son Doz Saati': p.lastDoseTime || '',
      'Diğer Kan Sulandırıcı': Array.isArray(p.otherAnticoagulant) ? p.otherAnticoagulant.join(', ') : (p.otherAnticoagulant || ''),
      'NSAİİ (Ağrı Kesici)': p.nsaidUse || '',
      'CYP3A4/P-gp İnhibitörleri': Array.isArray(p.cyp3a4PgpInhibitors) ? p.cyp3a4PgpInhibitors.join(', ') : (p.cyp3a4PgpInhibitors || ''),
      'CYP3A4 İndükleyicileri': Array.isArray(p.cyp3a4Inducers) ? p.cyp3a4Inducers.join(', ') : (p.cyp3a4Inducers || ''),
      'Cilt / Kolay Morarma (Ekimoz)': p.skinBruising || '',
      'Diş Eti Kanaması': p.gingivalBleeding || '',
      'Burun Kanaması (Epistaksis)': p.epistaxis || '',
      'Küçük Kesiklerde Uzun Kanama': p.cutsProlongedBleeding || '',
      'Melena (Siyah Katran Dışkı)': p.melena || '',
      'Hematokezya (Taze Kırmızı Kan)': p.hematochezia || '',
      'Hematemez (Kanlı Kusma / Kahve Telvesi)': p.hematemesis || '',
      'Hematüri (İdrarda Kan)': p.hematuria || '',
      'Menoraji / Aşırı Adet': p.menorrhagia || '',
      'Şiddetli Baş Ağrısı': p.severeHeadache || '',
      'Nörolojik Belirti (Baş dönmesi vb.)': p.neurologicalSymptoms || '',
      'Hemartroz (Eklem Şişliği / Ağrı)': p.hemarthrosis || '',
      'Hemoptizi (Kanlı Balgam)': p.hemoptysis || '',
      'Göz İçi Kanama / Kızarıklık': p.ocularBleeding || '',
      'Sağlık Kuruluşu / Acil Başvuru': p.hospitalVisit || '',
      'Kan Transfüzyonu': p.transfusionReceived || '',
      'Apixaban Tedavisine Ara Verme': p.treatmentInterruption || '',
      'Hb Düşüşü (>2 g/dL)': p.hbDrop || '',
      'Kanamaya Kadar Geçen Süre': p.bleedingOnsetTime || '',
      'Kanama Günü Doz Alımı': p.doseTimingOnBleedingDay || ''
    };

    // Include custom dynamic questions if any
    questions.filter(q => q.isCustom).forEach(q => {
      row[q.title] = Array.isArray(p[q.id]) ? p[q.id].join(', ') : (p[q.id] || '');
    });

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tez_Verileri');

  worksheet['!cols'] = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length + 3, 14)
  }));

  XLSX.writeFile(workbook, `Adnan_Tez_Veri_Raporu_${getFormattedTimestamp()}.xlsx`);
};

// 2. WORD (.doc) EXPORT
export const exportToWord = (patients: PatientRecord[]) => {
  if (!patients.length) {
    alert('Dışa aktarılacak kayıt bulunamadı.');
    return;
  }

  let patientRowsHtml = '';
  patients.forEach((p, index) => {
    patientRowsHtml += `
      <tr style="background-color: ${index % 2 === 0 ? '#f8fafc' : '#ffffff'};">
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${p.protocolNo || 'N/A'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${p.age || '-'} / ${p.gender || '-'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${p.indication || '-'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${p.apixabanDose || '-'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${p.lastDoseTime || '-'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${p.skinBruising || 'Hayır'} / ${p.epistaxis || 'Hayır'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${p.melena || 'Hayır'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${p.hospitalVisit || 'Hayır'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${p.transfusionReceived || 'Hayır'}</td>
      </tr>
    `;
  });

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Adnan Tez Formu Klinik Veri Raporu</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.4; }
        h1 { color: #1e3a8a; font-size: 18pt; margin-bottom: 4px; }
        h2 { color: #2563eb; font-size: 13pt; margin-top: 16px; border-bottom: 2px solid #2563eb; padding-bottom: 4px; }
        table { border-collapse: collapse; width: 100%; margin-top: 12px; font-size: 9pt; }
        th { background-color: #1e40af; color: #ffffff; padding: 7px; text-align: left; border: 1px solid #1e3a8a; }
        .meta-box { background: #f1f5f9; padding: 10px; border-left: 4px solid #3b82f6; margin-bottom: 14px; }
      </style>
    </head>
    <body>
      <h1>Adnan Tez Formu - Klinik ve Kanama Veri Dökümü</h1>
      <p style="color: #64748b; font-size: 10pt;">Rapor Tarihi: ${new Date().toLocaleString('tr-TR')} | Toplam Hasta Sayısı: <b>${patients.length}</b></p>
      
      <div class="meta-box">
        <strong>Önemli Klinik Not:</strong> Hastadan Mor Tüp Kan Alınacaktır (Plazma konsantrasyonu ve genotip-PK korelasyonu için).
      </div>

      <h2>Hasta ve Tedavi Özet Çizelgesi</h2>
      <table>
        <thead>
          <tr>
            <th>Protokol No</th>
            <th>Yaş / Cins</th>
            <th>Endikasyon</th>
            <th>Doz</th>
            <th>Son Doz Saati</th>
            <th>Morarma / Epistaksis</th>
            <th>Melena (GİS)</th>
            <th>Hastane Başvurusu</th>
            <th>Transfüzyon</th>
          </tr>
        </thead>
        <tbody>
          ${patientRowsHtml}
        </tbody>
      </table>

      <h2>Detaylı Hasta Kayıtları</h2>
      ${patients.map((p, idx) => `
        <div style="page-break-inside: avoid; margin-top: 12px; padding: 8px; border: 1px solid #e2e8f0; background: #fafafa;">
          <h3 style="margin: 0 0 4px 0; color: #0f172a;">${idx + 1}. Protokol: ${p.protocolNo || 'N/A'} (Yaş: ${p.age}, Cinsiyet: ${p.gender})</h3>
          <p style="margin: 2px 0;"><b>Kilo / Boy:</b> ${p.weightKg || '-'} kg / ${p.heightCm || '-'} cm | <b>CrCl / Serum Cr:</b> ${p.crCl || '-'} mL/dk / ${p.serumCreatinine || '-'} mg/dL</p>
          <p style="margin: 2px 0;"><b>Apixaban Dozu:</b> ${p.apixabanDose || '-'} | <b>Başlama:</b> ${p.treatmentStartDate || '-'} | <b>Son Doz:</b> ${p.lastDoseTime || '-'}</p>
          <p style="margin: 2px 0;"><b>Eşzamanlı İlaçlar:</b> Kan Sulandırıcı: ${Array.isArray(p.otherAnticoagulant) ? p.otherAnticoagulant.join(', ') : p.otherAnticoagulant || 'Yok'} | NSAİİ: ${p.nsaidUse || 'Yok'}</p>
          <p style="margin: 2px 0;"><b>CYP3A4/P-gp İnhibitörleri:</b> ${Array.isArray(p.cyp3a4PgpInhibitors) ? p.cyp3a4PgpInhibitors.join(', ') : p.cyp3a4PgpInhibitors || 'Yok'}</p>
          <p style="margin: 2px 0;"><b>Kanama Belirtileri:</b> Morarma: ${p.skinBruising || 'Hayır'}, Diş Eti: ${p.gingivalBleeding || 'Hayır'}, Epistaksis: ${p.epistaxis || 'Hayır'}, Melena: ${p.melena || 'Hayır'}, Hematüri: ${p.hematuria || 'Hayır'}</p>
          <p style="margin: 2px 0;"><b>Klinik Sonuçlar:</b> Başvuru: ${p.hospitalVisit || 'Hayır'}, Transfüzyon: ${p.transfusionReceived || 'Hayır'}, İlaç Ara Verme: ${p.treatmentInterruption || 'Hayır'}</p>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Adnan_Tez_Veri_Raporu_${getFormattedTimestamp()}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 3. PDF (.pdf) EXPORT
export const exportToPdf = (patients: PatientRecord[]) => {
  if (!patients.length) {
    alert('Dışa aktarılacak kayıt bulunamadı.');
    return;
  }

  const doc = new jsPDF('landscape', 'pt', 'a4');

  doc.setFillColor(88, 28, 135); // Deep purple for thesis
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 45, 'F');

  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('Adnan Tez Formu - Klinik Veri ve Kanama Taramasi Raporu', 40, 28);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')} | Toplam Hasta Sayisi: ${patients.length} | Mor Tup Kan Takibi`, 40, 65);

  const tableHead = [[
    'Protokol ID', 'Yas/Cins', 'Endikasyon', 'Doz', 'Son Doz Saati', 'CrCl / Krea', 'Morarma / Epistaksis', 'Melena (GIS)', 'Hosp/Yatis', 'Transfuzyon'
  ]];

  const tableBody = patients.map(p => [
    p.protocolNo || '-',
    `${p.age || '-'} / ${p.gender === 'Erkek' ? 'E' : p.gender === 'Kadın' ? 'K' : '-'}`,
    (p.indication || '-').slice(0, 20),
    (p.apixabanDose || '-').slice(0, 16),
    p.lastDoseTime || '-',
    `${p.crCl || '-'} / ${p.serumCreatinine || '-'}`,
    `${p.skinBruising || 'Hayir'} / ${p.epistaxis || 'Hayir'}`,
    p.melena || 'Hayir',
    (p.hospitalVisit || 'Hayir').slice(0, 16),
    p.transfusionReceived || 'Hayir'
  ]);

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 80,
    theme: 'striped',
    headStyles: {
      fillColor: [109, 40, 217],
      textColor: 255,
      fontSize: 8.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 4
    },
    alternateRowStyles: {
      fillColor: [250, 245, 255]
    },
    margin: { left: 25, right: 25 }
  });

  doc.save(`Adnan_Tez_Veri_Raporu_${getFormattedTimestamp()}.pdf`);
};

// 4. SPSS COMPATIBLE DATA & SYNTAX EXPORT
export const exportToSpss = (patients: PatientRecord[]) => {
  if (!patients.length) {
    alert('Dışa aktarılacak kayıt bulunamadı.');
    return;
  }

  const headers = [
    'PROT_ID', 'AGE', 'SEX', 'WEIGHT_KG', 'HEIGHT_CM',
    'INDICATION', 'SERUM_CR', 'CRCL', 'ALT_AST', 'HB_BASE',
    'APIX_DOSE', 'COMPLIANCE', 'LAST_DOSE_TIME',
    'NSAID_USE', 'SKIN_BRUISE', 'GINGIVAL_BLEED', 'EPISTAXIS',
    'MELENA', 'HEMATOCHEZIA', 'HEMATEMESIS', 'HEMATURIA',
    'SEVERE_HEADACHE', 'HEMARTHROSIS', 'HOSP_VISIT', 'TRANSFUSION',
    'TREAT_INTERRUPT', 'HB_DROP', 'DOSE_TIMING_DAY'
  ];

  const rows: string[] = [];
  rows.push(headers.join('\t'));

  patients.forEach(p => {
    const sex = p.gender === 'Erkek' ? 1 : p.gender === 'Kadın' ? 2 : 99;
    
    let indCode = 1;
    if (p.indication?.includes('DVT')) indCode = 2;
    else if (p.indication?.includes('Ortopedik')) indCode = 3;
    else if (p.indication?.includes('Diğer')) indCode = 4;

    let doseCode = 2; // 5 mg bid
    if (p.apixabanDose?.includes('2.5 mg')) doseCode = 1;
    else if (p.apixabanDose?.includes('Diğer')) doseCode = 3;

    let complianceCode = 1;
    if (p.complianceLevel?.includes('Haftada 1-2')) complianceCode = 2;
    else if (p.complianceLevel?.includes('Sık sık')) complianceCode = 3;

    const row = [
      `"${p.protocolNo || ''}"`,
      p.age || '',
      sex,
      p.weightKg || '',
      p.heightCm || '',
      indCode,
      p.serumCreatinine || '',
      p.crCl || '',
      `"${p.altAst || ''}"`,
      p.hbValue || '',
      doseCode,
      complianceCode,
      `"${p.lastDoseTime || ''}"`,
      p.nsaidUse?.includes('Evet') ? 1 : 0,
      p.skinBruising?.includes('Evet') ? 1 : 0,
      p.gingivalBleeding?.includes('Evet') ? 1 : 0,
      p.epistaxis?.includes('Evet') ? 1 : 0,
      p.melena?.includes('Evet') ? 1 : 0,
      p.hematochezia?.includes('Evet') ? 1 : 0,
      p.hematemesis?.includes('Evet') ? 1 : 0,
      p.hematuria?.includes('Evet') ? 1 : 0,
      p.severeHeadache?.includes('Evet') ? 1 : 0,
      p.hemarthrosis?.includes('Evet') ? 1 : 0,
      p.hospitalVisit?.includes('Evet') ? 1 : 0,
      p.transfusionReceived?.includes('Evet') ? 1 : 0,
      p.treatmentInterruption?.includes('Evet') ? 1 : 0,
      p.hbDrop?.includes('Evet') ? 1 : 0,
      p.doseTimingOnBleedingDay?.includes('Evet') ? 1 : 0
    ];

    rows.push(row.join('\t'));
  });

  // Download .dat tab-delimited
  const datContent = rows.join('\r\n');
  const datBlob = new Blob([datContent], { type: 'text/tab-separated-values;charset=utf-8' });
  const datUrl = URL.createObjectURL(datBlob);
  const datLink = document.createElement('a');
  datLink.href = datUrl;
  datLink.download = `Adnan_Tez_SPSS_Veri_${getFormattedTimestamp()}.dat`;
  document.body.appendChild(datLink);
  datLink.click();
  document.body.removeChild(datLink);
  URL.revokeObjectURL(datUrl);

  // Download .sps SPSS Syntax
  const spssSyntax = `* SPSS Syntax for Adnan Tez Formu.
GET DATA
 /TYPE=TXT
 /FILE="Adnan_Tez_SPSS_Veri_${getFormattedTimestamp()}.dat"
 /DELCASE=LINE
 /DELIMITERS="\\t"
 /ARRANGEMENT=DELIMITED
 /FIRSTCASE=2
 /VARIABLES=
  PROT_ID A20
  AGE F3.0
  SEX F1.0
  WEIGHT_KG F4.1
  HEIGHT_CM F4.1
  INDICATION F1.0
  SERUM_CR F4.2
  CRCL F4.1
  ALT_AST A15
  HB_BASE F4.1
  APIX_DOSE F1.0
  COMPLIANCE F1.0
  LAST_DOSE_TIME A10
  NSAID_USE F1.0
  SKIN_BRUISE F1.0
  GINGIVAL_BLEED F1.0
  EPISTAXIS F1.0
  MELENA F1.0
  HEMATOCHEZIA F1.0
  HEMATEMESIS F1.0
  HEMATURIA F1.0
  SEVERE_HEADACHE F1.0
  HEMARTHROSIS F1.0
  HOSP_VISIT F1.0
  TRANSFUSION F1.0
  TREAT_INTERRUPT F1.0
  HB_DROP F1.0
  DOSE_TIMING_DAY F1.0.
CACHE.
EXECUTE.

VARIABLE LABELS
  PROT_ID "Hasta Protokol / ID No"
  AGE "Hasta Yasi"
  SEX "Cinsiyet"
  WEIGHT_KG "Vucut Agirligi (kg)"
  HEIGHT_CM "Boy (cm)"
  INDICATION "Apixaban Endikasyonu"
  SERUM_CR "Serum Kreatinin (mg/dL)"
  CRCL "Tahmini CrCl (mL/dk)"
  ALT_AST "ALT / AST (IU/L)"
  HB_BASE "Hemoglobin (g/dL)"
  APIX_DOSE "Apixaban Dozu"
  COMPLIANCE "Ilac Tedavi Uyumu"
  LAST_DOSE_TIME "Son Doz Saati"
  NSAID_USE "NSAII Romatizma Ilaci"
  SKIN_BRUISE "Ciltte Kolay Morarma"
  GINGIVAL_BLEED "Dis Eti Kanamasi"
  EPISTAXIS "Burun Kanamasi"
  MELENA "Melena (Siyah Katran Diski)"
  HEMATOCHEZIA "Hematokezya (Taze Kan)"
  HEMATEMESIS "Hematemez (Kanli Kusma)"
  HEMATURIA "Hematuri (Idrarda Kan)"
  SEVERE_HEADACHE "Siddetli Bas Agrisi"
  HEMARTHROSIS "Hemartroz (Eklem Sisligi)"
  HOSP_VISIT "Saglik Kurulusu Basvurusu"
  TRANSFUSION "Kan Transfuzyonu"
  TREAT_INTERRUPT "Tedaviye Ara Verme"
  HB_DROP "Hb Dususu (>2 g/dL)"
  DOSE_TIMING_DAY "Kanama Gunu Normal Doz Alimi".

VALUE LABELS
  SEX 1 "Erkek" 2 "Kadin"
  /INDICATION 1 "AF" 2 "DVT/PE" 3 "Ortopedik Koruma" 4 "Diger"
  /APIX_DOSE 1 "2.5 mg bid" 2 "5 mg bid" 3 "Diger"
  /COMPLIANCE 1 "Duzenli" 2 "Haftada 1-2 Unutuyor" 3 "Sik Doz Atliyor"
  /NSAID_USE 0 "Hayir" 1 "Evet"
  /SKIN_BRUISE 0 "Hayir" 1 "Evet"
  /GINGIVAL_BLEED 0 "Hayir" 1 "Evet"
  /EPISTAXIS 0 "Hayir" 1 "Evet"
  /MELENA 0 "Hayir" 1 "Evet"
  /HEMATOCHEZIA 0 "Hayir" 1 "Evet"
  /HEMATEMESIS 0 "Hayir" 1 "Evet"
  /HEMATURIA 0 "Hayir" 1 "Evet"
  /SEVERE_HEADACHE 0 "Hayir" 1 "Evet"
  /HEMARTHROSIS 0 "Hayir" 1 "Evet"
  /HOSP_VISIT 0 "Hayir" 1 "Evet"
  /TRANSFUSION 0 "Hayir" 1 "Evet"
  /TREAT_INTERRUPT 0 "Hayir" 1 "Evet"
  /HB_DROP 0 "Hayir" 1 "Evet"
  /DOSE_TIMING_DAY 0 "Hayir" 1 "Evet".
EXECUTE.
`;

  setTimeout(() => {
    const spsBlob = new Blob([spssSyntax], { type: 'text/plain;charset=utf-8' });
    const spsUrl = URL.createObjectURL(spsBlob);
    const spsLink = document.createElement('a');
    spsLink.href = spsUrl;
    spsLink.download = `Adnan_Tez_SPSS_Syntax_${getFormattedTimestamp()}.sps`;
    document.body.appendChild(spsLink);
    spsLink.click();
    document.body.removeChild(spsLink);
    URL.revokeObjectURL(spsUrl);
  }, 400);
};

// 5. PRINTABLE BLANK FORM PDF EXPORT (PROFESSIONAL 2-PAGE MEDICAL CRF LAYOUT)
export const exportBlankFormPdf = () => {
  const doc = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt
  const margin = 32;
  const contentWidth = pageWidth - margin * 2; // 531.28 pt

  // ================= PAGE 1 =================
  // Header Banner
  doc.setFillColor(76, 29, 149); // Deep Purple 900
  doc.rect(margin, 24, contentWidth, 34, 'F');

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('ADNAN TEZ FORMU', margin + 12, 42);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Apixaban Farmakogenetik ve Klinik Kanama Degerlendirme Veri Toplama Formu (CRF)', margin + 12, 53);

  // Purple Alert Badge
  doc.setFillColor(243, 232, 255); // Purple 100
  doc.setDrawColor(168, 85, 247); // Purple 500
  doc.setLineWidth(1);
  doc.roundedRect(margin, 63, contentWidth, 20, 3, 3, 'FD');

  doc.setTextColor(107, 33, 168); // Purple 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('* ONEMLI KLINIK UYARI: HASTADAN MOR TUP (EDTA) KAN ALINACAKTIR *', pageWidth / 2, 76, { align: 'center' });

  let currentY = 90;

  // BÖLÜM 1: DEMOGRAFİK VE KLİNİK
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['BOLUM 1: Hasta Demografik ve Temel Klinik Bilgileri', '']],
    body: [
      [
        { content: 'Hasta Protokol / ID No: ______________________    Tarih: ____/____/202___', styles: { fontStyle: 'bold' } },
        { content: 'Cinsiyet:  [  ] Kadin *    [  ] Erkek\n(*Kadin cinsiyette pik plazma konsantrasyonu onemlidir)' }
      ],
      [
        { content: 'Yas: _______       Vucut Agirligi: _______ kg       Boy: _______ cm       VKI: _______ kg/m2', colSpan: 2 }
      ],
      [
        {
          content: 'Apixaban Kullanim Endikasyonu:\n' +
            '  [  ] Atriyal Fibrilasyon (AF) (Inme / sistemik emboli onlenmesi)\n' +
            '  [  ] Derin Ven Trombozu (DVT) veya Akciger Embolisi (PE) tedavisi / onlenmesi\n' +
            '  [  ] Ortopedik cerrahi sonrasi tromboz korumasi\n' +
            '  [  ] Diger: ____________________________________________________________________',
          colSpan: 2
        }
      ],
      [
        {
          content: 'Son Laboratuvar Degerleri (Varsa):\n' +
            '  * Serum Kreatinin: ____________ mg/dL         * Tahmini CrCl (Klerens): ____________ mL/dk\n' +
            '  * ALT / AST: ____________ IU/L                * Hemoglobin (Hb): ____________ g/dL',
          colSpan: 2
        }
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: 255,
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: 4
    },
    styles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.5
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // BÖLÜM 2: APIXABAN KULLANIM VE UYUM
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['BOLUM 2: Apixaban Kullanim ve Uyum Detaylari', '']],
    body: [
      [
        { content: 'Gunluk Apixaban Dozu:   [  ] Gunde 2 kez 2.5 mg     [  ] Gunde 2 kez 5 mg     [  ] Diger: _______________' },
        { content: 'Tedaviye Baslama (Tarih / Ay): ________________________' }
      ],
      [
        { content: 'Ilac Uyumu / Sadakati:   [  ] Her gun zamaninda     [  ] Haftada 1-2 doz unutuyor     [  ] Sik sik doz atliyor', colSpan: 2 }
      ],
      [
        {
          content: 'Son Apixaban Dozunu Saat Kacta Aldiniz?:\n' +
            '  Saat:  [  ______ : ______  ]   (Kan alma ve plazma konsantrasyon duzeyi tayini icin gereklidir)',
          colSpan: 2,
          styles: { fontStyle: 'bold', fillColor: [248, 250, 252] }
        }
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: 255,
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: 4
    },
    styles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.5
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // BÖLÜM 3: EŞZAMANLI İLAÇLAR VE ETKİLEŞİM
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['BOLUM 3: Eszamanli Ilac Kullanimi ve Etkilesim Taramasi (CYP3A4 / P-gp)', '']],
    body: [
      [
        { content: 'Duzenli Baska Kan Sulandirici / Pihti Onleyici:\n  [  ] Hayir     [  ] Aspirin     [  ] Klopidogrel / Tikagrelor     [  ] Heparin' },
        { content: 'Agri Kesici / Romatizma Ilaci (NSAII):\n  [  ] Hayir     [  ] Evet ->  [  ] Duzenli     [  ] Seyrek' }
      ],
      [
        {
          content: 'Guclu/Orta CYP3A4 ve P-gp Inhibitorleri (Konsantrasyonu Artiranlar - Son 1 Ay):\n' +
            '  [  ] Amiodaron     [  ] Verapamil     [  ] Diltiazem     [  ] Ketokonazol / Itrakonazol     [  ] Klaritromisin     [  ] Hicbiri',
          colSpan: 2
        }
      ],
      [
        {
          content: 'Guclu Enzim Indukleyicileri (Konsantrasyonu Dusurenler - Son 1 Ay):\n' +
            '  [  ] Rifampisin     [  ] Karbamazepin     [  ] Fenitoin     [  ] Sari Kantaron (St. John\'s Wort)     [  ] Hicbiri',
          colSpan: 2
        }
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: 255,
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: 4
    },
    styles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.5
    }
  });

  // Footer Page 1
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Adnan Tez Formu - Manuel Klinik Veri Toplama Formu (CRF)   |   Sayfa 1 / 2', pageWidth / 2, pageHeight - 16, { align: 'center' });

  // ================= PAGE 2 =================
  doc.addPage();

  // Page 2 Header Banner
  doc.setFillColor(76, 29, 149);
  doc.rect(margin, 24, contentWidth, 24, 'F');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('ADNAN TEZ FORMU - BOLUM 4, 5 VE 6', margin + 12, 39);

  currentY = 56;

  // BÖLÜM 4: ORGAN SİSTEMLERİNE GÖRE KANAMA MATRIX TABLE
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[
      { content: 'BOLUM 4: Organ Sistemlerine Gore Kanama Belirtilerinin Taramasi (ISTH)', colSpan: 3 }
    ], [
      'No & Anatomik Bolge / Kanama Belirtisi',
      'HAYIR',
      'EVET (Klinik Detay / Siddet Derecesi / Sure)'
    ]],
    body: [
      // A. Cilt & Mukoza
      [{ content: 'A. Cilt ve Yuzeyel / Mukoza Kanamalari (Minor)', colSpan: 3, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }],
      ['1. Sebepsiz veya kolayca morarma / mor lekeler (Ekimoz)', '[  ]', '[  ] Evet -> [  ] Kucuk <2 cm    [  ] Genis >5 cm'],
      ['2. Dis fircalarken veya kendiliginden dis eti kanamasi', '[  ]', '[  ] Evet -> [  ] <5 dakika    [  ] >5 dakika / Zor duruyor'],
      ['3. Burun kanamasi (Epistaksis)', '[  ]', '[  ] Evet -> Siklik: [  ] Ayda 1-2   [  ] Haftalik | [  ] <10 dk   [  ] >10 dk'],
      ['4. Kucuk kesiklerde veya tirasta uzun suren kanama', '[  ]', '[  ] Evet'],

      // B. GIS
      [{ content: 'B. Gastrointestinal Sistem Kanamalari (GIS - Major / CRNMB Suphesi)', colSpan: 3, styles: { fillColor: [254, 242, 242], fontStyle: 'bold', textColor: [153, 27, 27] } }],
      ['5. Diskinin katran gibi siyahlasmasi (Melena)', '[  ]', '[  ] Evet (Gastrointestinal kanama suphesi)'],
      ['6. Diskida veya tuvalette taze kirmizi kan (Hematokezya)', '[  ]', '[  ] Evet'],
      ['7. Kusma ile kan veya kahve telvesi benzeri parçacıklar (Hematemez)', '[  ]', '[  ] Evet'],

      // C. Ürogenital
      [{ content: 'C. Urogenital Sistem Kanamalari', colSpan: 3, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }],
      ['8. Idrarda pembe, kirmizi veya cay rengi degisme (Hematuri)', '[  ]', '[  ] Evet'],
      ['9. (Kadin Hastalar) Adet kanamasinda asiri artis (Menoraji)', '[  ]', '[  ] Evet       [  ] Menopozda / Uygulanamaz'],

      // D. Nörolojik / SSS
      [{ content: 'D. Santral Sinir Sistemi / Norolojik Belirtiler (Major Kanama Suphesi)', colSpan: 3, styles: { fillColor: [254, 242, 242], fontStyle: 'bold', textColor: [153, 27, 27] } }],
      ['10. Aniden baslayan en siddetli bas agrisi', '[  ]', '[  ] Evet (Acil intrakraniyal kanama suphesi)'],
      ['11. Ani bas donmesi, gorme/konusma guclugu veya uyusma', '[  ]', '[  ] Evet'],

      // E. Kas & Eklem
      [{ content: 'E. Kas, Eklem ve Derin Doku Kanamalari', colSpan: 3, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }],
      ['12. Darbe almadan eklemde ani sislik ve agri (Hemartroz)', '[  ]', '[  ] Evet'],
      ['13. Oksurukle kan veya kanli balgam gelmesi (Hemoptizi)', '[  ]', '[  ] Evet'],
      ['14. Goz icinde kan oturmasi (Subkonjonktival kanama)', '[  ]', '[  ] Evet']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 3.5
    },
    columnStyles: {
      0: { cellWidth: 260 },
      1: { cellWidth: 45, halign: 'center' },
      2: { cellWidth: 'auto' }
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3.5,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.5
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // BÖLÜM 5: KANAMA ŞİDDETİ VE KLİNİK SONUÇLAR
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['BOLUM 5: Kanama Siddeti ve Klinik Sonuclarinin Derecelendirilmesi', '']],
    body: [
      [
        { content: '1. Saglik Kurulusuna Basvuru:\n  [  ] Hayir     [  ] Evet -> [  ] Poliklinik   [  ] Acil   [  ] Yatis' },
        { content: '2. Kan Transfuzyonu:\n  [  ] Hayir     [  ] Evet -> Miktar: ________ unite' }
      ],
      [
        { content: '3. Apixaban Tedavisine Ara Verilmesi / Kesilmesi:\n  [  ] Hayir     [  ] Evet -> Ara Suresi: ________ gun' },
        { content: '4. Hemoglobin Dususu (>2 g/dL):\n  [  ] Hayir     [  ] Evet     [  ] Bilinmiyor' }
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 3.5
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.5
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // BÖLÜM 6: ZAMANSAL İLİŞKİ & ONAY
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['BOLUM 6: Zamansal Iliski ve Arastirmaci Hekim Onay Alani', '']],
    body: [
      [
        {
          content: '1. Ilk Kanama Belirtisi Apixaban Baslandiktan Ne Kadar Sure Sonra Cikti?:\n' +
            '  Cevap: ____________________________________________________________________________________',
          colSpan: 2
        }
      ],
      [
        {
          content: '2. Kanama Gunu Doz Durumu:  [  ] Zamaninda tam doz aldim     [  ] Cift doz almistim\n' +
            '                             [  ] Ilactan hemen sonra kanadi    [  ] Kanama olmadi / Uygulanamaz',
          colSpan: 2
        }
      ],
      [
        {
          content: 'Arastirmaci Hekim Notu / Klinik Gozlem:\n' +
            '____________________________________________________________________________________________',
          colSpan: 2
        }
      ],
      [
        { content: 'Degerlendiren Arastirmaci Hekim:\n____________________________________', styles: { fontStyle: 'bold' } },
        { content: 'Imza / Kase: ____________________       Tarih: ____/____/202___', styles: { fontStyle: 'bold' } }
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 3.5
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.5
    }
  });

  // Footer Page 2
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Adnan Tez Formu - Manuel Klinik Veri Toplama Formu (CRF)   |   Sayfa 2 / 2', pageWidth / 2, pageHeight - 16, { align: 'center' });

  doc.save(`Adnan_Tez_Bos_Form_${getFormattedTimestamp()}.pdf`);
};

// 6. PRINTABLE FILLED PATIENT FORM PDF EXPORT
export const exportFilledPatientPdf = (p: Record<string, any>) => {
  const doc = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 32;
  const contentWidth = pageWidth - margin * 2;

  // ================= PAGE 1 =================
  doc.setFillColor(76, 29, 149); // Deep Purple
  doc.rect(margin, 24, contentWidth, 34, 'F');

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`ADNAN TEZ FORMU • HASTA KAYIT RAPORU: ${p.protocolNo || 'KAYIT'}`, margin + 12, 42);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Apixaban Farmakogenetik ve Klinik Kanama Degerlendirme Formu (Doldurulmus Veri)', margin + 12, 53);

  // Purple Alert Badge
  doc.setFillColor(243, 232, 255);
  doc.setDrawColor(168, 85, 247);
  doc.setLineWidth(1);
  doc.roundedRect(margin, 63, contentWidth, 20, 3, 3, 'FD');

  doc.setTextColor(107, 33, 168);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('* ONEMLI KLINIK UYARI: HASTADAN MOR TUP (EDTA) KAN ALINACAKTIR *', pageWidth / 2, 76, { align: 'center' });

  let currentY = 90;

  // BÖLÜM 1
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['BOLUM 1: Hasta Demografik ve Temel Klinik Bilgileri', '']],
    body: [
      [
        { content: `Hasta Protokol / ID No: ${p.protocolNo || '-'}`, styles: { fontStyle: 'bold' } },
        { content: `Cinsiyet: ${p.gender || '-'}       Yas: ${p.age || '-'} yil`, styles: { fontStyle: 'bold' } }
      ],
      [
        { content: `Vucut Agirligi: ${p.weightKg || '-'} kg        Boy: ${p.heightCm || '-'} cm        VKI: ${p.weightKg && p.heightCm ? (Number(p.weightKg) / Math.pow(Number(p.heightCm)/100, 2)).toFixed(1) + ' kg/m2' : '-'}`, colSpan: 2 }
      ],
      [
        { content: `Apixaban Kullanim Endikasyonu:\n  -> ${p.indication || '-'}`, colSpan: 2 }
      ],
      [
        {
          content: `Son Laboratuvar Degerleri:\n` +
            `  * Serum Kreatinin: ${p.serumCreatinine || '-'} mg/dL          * Tahmini CrCl (Klerens): ${p.crCl || '-'} mL/dk\n` +
            `  * ALT / AST: ${p.altAst || '-'} IU/L                 * Hemoglobin (Hb): ${p.hbValue || '-'} g/dL`,
          colSpan: 2
        }
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8.5, fontStyle: 'bold', cellPadding: 4 },
    styles: { fontSize: 8, cellPadding: 4.5, textColor: [30, 41, 59], lineColor: [203, 213, 225], lineWidth: 0.5 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // BÖLÜM 2
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['BOLUM 2: Apixaban Kullanim ve Uyum Detaylari', '']],
    body: [
      [
        { content: `Gunluk Doz: ${p.apixabanDose || '-'}` },
        { content: `Tedavi Baslangici: ${p.treatmentStartDate || '-'}` }
      ],
      [
        { content: `Ilac Sadakati / Uyumu: ${p.complianceLevel || '-'}`, colSpan: 2 }
      ],
      [
        {
          content: `Son Apixaban Doz Saati:  [ ${p.lastDoseTime || '-'} ]  (Plazma tayini icin gereklidir)`,
          colSpan: 2,
          styles: { fontStyle: 'bold', fillColor: [248, 250, 252] }
        }
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8.5, fontStyle: 'bold', cellPadding: 4 },
    styles: { fontSize: 8, cellPadding: 4.5, textColor: [30, 41, 59], lineColor: [203, 213, 225], lineWidth: 0.5 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // BÖLÜM 3
  const otherAnti = Array.isArray(p.otherAnticoagulant) ? p.otherAnticoagulant.join(', ') : (p.otherAnticoagulant || 'Hayir');
  const inhibitors = Array.isArray(p.cyp3a4PgpInhibitors) ? p.cyp3a4PgpInhibitors.join(', ') : (p.cyp3a4PgpInhibitors || 'Hicbiri');
  const inducers = Array.isArray(p.cyp3a4Inducers) ? p.cyp3a4Inducers.join(', ') : (p.cyp3a4Inducers || 'Hicbiri');

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['BOLUM 3: Eszamanli Ilac Kullanimi ve Etkilesim Taramasi', '']],
    body: [
      [
        { content: `Duzenli Diger Kan Sulandirici / Antiagregan:\n  -> ${otherAnti}` },
        { content: `Agri Kesici / Romatizma Ilaci (NSAII):\n  -> ${p.nsaidUse || 'Hayir'}` }
      ],
      [
        { content: `CYP3A4 ve P-gp Inhibitorleri (Konsantrasyon Artiranlar):\n  -> ${inhibitors}`, colSpan: 2 }
      ],
      [
        { content: `Guclu Enzim Indukleyicileri (Konsantrasyon Dusurenler):\n  -> ${inducers}`, colSpan: 2 }
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8.5, fontStyle: 'bold', cellPadding: 4 },
    styles: { fontSize: 8, cellPadding: 4.5, textColor: [30, 41, 59], lineColor: [203, 213, 225], lineWidth: 0.5 }
  });

  // Footer Page 1
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Adnan Tez Formu • Hasta Kayit Raporu (${p.protocolNo || 'KAYIT'})   |   Sayfa 1 / 2`, pageWidth / 2, pageHeight - 16, { align: 'center' });

  // ================= PAGE 2 =================
  doc.addPage();
  doc.setFillColor(76, 29, 149);
  doc.rect(margin, 24, contentWidth, 24, 'F');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`ADNAN TEZ FORMU • KANAMA VE KLINIK SONUCLAR (${p.protocolNo || 'KAYIT'})`, margin + 12, 39);

  currentY = 56;

  // BÖLÜM 4: 14 KANAMA BELİRTİSİ
  const formatBleedRow = (symptom: string, val: string | undefined) => {
    const isYes = val && val !== 'Hayir' && !val.includes('Uygulanamaz');
    return [symptom, isYes ? 'EVET' : (val || 'Hayir'), isYes ? val! : '-'];
  };

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[
      { content: 'BOLUM 4: Organ Sistemlerine Gore Kanama Belirtileri (ISTH)', colSpan: 3 }
    ], [
      'Kanama Belirtisi & Anatomik Bolge',
      'Durum',
      'Klinik Detay / Derece'
    ]],
    body: [
      [{ content: 'A. Cilt ve Yuzeyel / Mukoza Kanamalari (Minor)', colSpan: 3, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }],
      formatBleedRow('1. Kolayca morarma / lekeler (Ekimoz)', p.skinBruising),
      formatBleedRow('2. Dis eti kanamasi', p.gingivalBleeding),
      formatBleedRow('3. Burun kanamasi (Epistaksis)', p.epistaxis),
      formatBleedRow('4. Kucuk kesiklerde uzun kanama', p.cutsProlongedBleeding),

      [{ content: 'B. Gastrointestinal Sistem Kanamalari (GIS - Major / CRNMB)', colSpan: 3, styles: { fillColor: [254, 242, 242], fontStyle: 'bold', textColor: [153, 27, 27] } }],
      formatBleedRow('5. Katran gibi siyah diski (Melena)', p.melena),
      formatBleedRow('6. Taze kirmizi kan (Hematokezya)', p.hematochezia),
      formatBleedRow('7. Kanli kusma (Hematemez)', p.hematemesis),

      [{ content: 'C. Urogenital Sistem Kanamalari', colSpan: 3, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }],
      formatBleedRow('8. Idrarda kan (Hematuri)', p.hematuria),
      formatBleedRow('9. (Kadin) Asiri adet kanamasi (Menoraji)', p.menorrhagia),

      [{ content: 'D. Santral Sinir Sistemi / Norolojik Belirtiler (Major Suphesi)', colSpan: 3, styles: { fillColor: [254, 242, 242], fontStyle: 'bold', textColor: [153, 27, 27] } }],
      formatBleedRow('10. En siddetli bas agrisi (Ani baslangicli)', p.severeHeadache),
      formatBleedRow('11. Bas donmesi, gorme/konusma bozuklugu, uyusma', p.neurologicalSymptoms),

      [{ content: 'E. Kas, Eklem ve Derin Doku Kanamalari', colSpan: 3, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } }],
      formatBleedRow('12. Eklemde ani sislik ve agri (Hemartroz)', p.hemarthrosis),
      formatBleedRow('13. Oksurukle kan gelmesi (Hemoptizi)', p.hemoptysis),
      formatBleedRow('14. Goz icinde kan oturmasi (Subkonjonktival)', p.ocularBleeding)
    ],
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3.5 },
    columnStyles: { 0: { cellWidth: 260 }, 1: { cellWidth: 60, halign: 'center' }, 2: { cellWidth: 'auto' } },
    styles: { fontSize: 7.5, cellPadding: 3.5, textColor: [30, 41, 59], lineColor: [203, 213, 225], lineWidth: 0.5 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // BÖLÜM 5
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['BOLUM 5: Kanama Siddeti ve Klinik Sonuclar', '']],
    body: [
      [
        { content: `Saglik Kurulusuna Basvuru: ${p.hospitalVisit || 'Hayir'}` },
        { content: `Kan Transfuzyonu: ${p.transfusionReceived || 'Hayir'}` }
      ],
      [
        { content: `Apixaban Tedavisine Ara Verme: ${p.treatmentInterruption || 'Hayir'}` },
        { content: `Hb Belirgin Dusus (>2 g/dL): ${p.hbDrop || 'Hayir'}` }
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3.5 },
    styles: { fontSize: 7.5, cellPadding: 4, textColor: [30, 41, 59], lineColor: [203, 213, 225], lineWidth: 0.5 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // BÖLÜM 6
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['BOLUM 6: Zamansal Iliski ve Onay', '']],
    body: [
      [
        { content: `Ilk Kanama Ne Zaman Cikti?: ${p.bleedingOnsetTime || 'Belirtilmedi'}` },
        { content: `Kanama Gunu Doz Durumu: ${p.doseTimingOnBleedingDay || 'Belirtilmedi'}` }
      ],
      [
        { content: 'Form Durumu: Hasta / Arastirmaci tarafindan kaydedilmistir.', colSpan: 2 }
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8, fontStyle: 'bold', cellPadding: 3.5 },
    styles: { fontSize: 7.5, cellPadding: 4, textColor: [30, 41, 59], lineColor: [203, 213, 225], lineWidth: 0.5 }
  });

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Adnan Tez Formu • Hasta Kayit Raporu (${p.protocolNo || 'KAYIT'})   |   Sayfa 2 / 2`, pageWidth / 2, pageHeight - 16, { align: 'center' });

  doc.save(`Adnan_Tez_Hasta_${p.protocolNo || 'Kayit'}_${getFormattedTimestamp()}.pdf`);
};

