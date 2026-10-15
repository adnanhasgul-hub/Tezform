import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { exportBlankFormPdf, exportFilledPatientPdf } from '../utils/exportUtils';

interface PrintableBlankFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  filledData?: Record<string, any>;
}

export const PrintableBlankFormModal: React.FC<PrintableBlankFormModalProps> = ({
  isOpen,
  onClose,
  filledData
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'page1' | 'page2'>('all');

  if (!isOpen) return null;

  const isFilled = Boolean(filledData && Object.keys(filledData).length > 0 && (filledData.protocolNo || filledData.age || filledData.indication));

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (isFilled && filledData) {
      exportFilledPatientPdf(filledData);
    } else {
      exportBlankFormPdf();
    }
  };

  // Helper to test if an option is selected in filledData
  const isMatch = (field: string, val: string) => {
    if (!isFilled || !filledData || !filledData[field]) return false;
    const v = filledData[field];
    if (Array.isArray(v)) {
      return v.includes(val);
    }
    return String(v).trim().toLowerCase() === val.trim().toLowerCase() || String(v).includes(val);
  };

  const isNo = (field: string) => {
    if (!isFilled || !filledData || !filledData[field]) return false;
    const v = String(filledData[field]);
    return v === 'Hayır' || v === '0';
  };

  const isYes = (field: string) => {
    if (!isFilled || !filledData || !filledData[field]) return false;
    const v = String(filledData[field]);
    return v.includes('Evet') || v === '1';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[96vh] flex flex-col">
        
        {/* Top Control Bar (Hidden when printed) */}
        <div className="print:hidden bg-slate-900 px-6 py-3.5 text-white shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  {isFilled ? `Adnan Tez Formu • Hasta Veri Çıktısı (${filledData?.protocolNo || 'Kayıt'})` : 'Adnan Tez Formu • Yazdırılabilir Boş Form'}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isFilled ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300' : 'bg-purple-500/20 border border-purple-400 text-purple-200'
                }`}>
                  {isFilled ? 'Doldurulmuş Klinik Form' : 'Boş CRF Formu'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {isFilled
                  ? 'Girdiğiniz verilerle doldurulmuş A4 formatında klinik rapor. Yazdırabilir veya PDF olarak kaydedebilirsiniz.'
                  : 'A4 standartlarına tam uyumlu, araştırmacı ve hekimler için ferah ve anlaşılır klinik veri toplama belgesi.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="hidden sm:flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs mr-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeTab === 'all' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tüm Form (2 Sayfa)
              </button>
              <button
                onClick={() => setActiveTab('page1')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeTab === 'page1' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Sayfa
              </button>
              <button
                onClick={() => setActiveTab('page2')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeTab === 'page2' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Sayfa
              </button>
            </div>

            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:shadow-purple-600/30"
              title="Formu yüksek çözünürlüklü 2 sayfalık PDF olarak bilgisayara indirir"
            >
              <Download className="w-4 h-4" />
              <span>{isFilled ? 'Hasta PDF İndir' : 'PDF Olarak İndir'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:shadow-indigo-600/30"
              title="A4 kağıda yazdır"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE FORM BODY (Authentic 2-Page Clinical CRF Layout) */}
        <div className="p-4 sm:p-8 overflow-y-auto font-sans text-slate-900 bg-slate-200/60 print:bg-white print:p-0 print:m-0 print:overflow-visible flex-1">
          
          {/* ========================================================= */}
          {/* A4 PAGE 1 CONTAINER */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'page1') && (
            <div className="max-w-[850px] mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-300 print:border-none print:shadow-none print:p-8 print:m-0 mb-8 page-break-after">
              
              {/* Institutional Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded">
                      KLİNİK VE FARMAKOGENETİK ARAŞTIRMA FORMU (CRF)
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                    ADNAN TEZ FORMU
                  </h1>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Apixaban Tedavisi Alan Hastalarda Kanama Riski ve Klinik Veri Toplama Çizelgesi
                  </p>
                </div>

                <div className="text-right">
                  <div className="border-2 border-purple-600 bg-purple-50 text-purple-950 px-3.5 py-2 rounded-xl text-center font-black text-xs shadow-xs">
                    ⚠️ DİKKAT: HASTADAN MOR TÜP (EDTA) KAN ALINACAKTIR
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-mono">Sayfa 1 / 2</span>
                </div>
              </div>

              {/* Protocol & Date Box */}
              <div className="grid grid-cols-3 gap-4 p-3.5 bg-slate-50 border border-slate-300 rounded-xl mb-5 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wide">Hasta TC:</span>
                  <div className="border-b-2 border-slate-400 h-7 flex items-end font-mono font-bold text-slate-900 text-sm">
                    {filledData?.protocolNo || ''}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wide">Form Doldurma Tarihi:</span>
                  <div className="border-b-2 border-slate-400 h-7 flex items-end text-slate-800 font-medium">
                    {filledData?.createdAt ? new Date(filledData.createdAt).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wide">Araştırmacı Hekim / Merkez:</span>
                  <div className="border-b-2 border-slate-400 h-7 flex items-end text-slate-700 font-medium">
                    Adnan Tez Araştırma Protokolü
                  </div>
                </div>
              </div>

              {/* BÖLÜM 1 */}
              <div className="border border-slate-300 rounded-xl overflow-hidden mb-5">
                <div className="bg-slate-800 text-white px-4 py-2 font-bold text-xs flex justify-between items-center">
                  <span>BÖLÜM 1: Hasta Demografik ve Temel Klinik Bilgileri</span>
                  <span className="text-slate-300 text-[11px] font-normal">Plazma Maruziyeti & İlaç Klerensi Taraması</span>
                </div>

                <div className="p-4 space-y-4 text-xs">
                  {/* Demographics Row */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <span className="text-slate-600 font-bold block mb-1">Yaş:</span>
                      <div className="border border-slate-300 bg-slate-50/50 rounded-lg h-8 px-2 flex items-center font-bold text-slate-900">
                        {filledData?.age ? `${filledData.age} yıl` : '_______ yıl'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600 font-bold block mb-1">Cinsiyet:</span>
                      <div className="border border-slate-300 bg-slate-50/50 rounded-lg h-8 px-2 flex items-center gap-4 font-semibold">
                        <span className={isMatch('gender', 'Kadın') ? 'font-black text-purple-900' : ''}>
                          {isMatch('gender', 'Kadın') ? '☑' : '☐'} Kadın *
                        </span>
                        <span className={isMatch('gender', 'Erkek') ? 'font-black text-purple-900' : ''}>
                          {isMatch('gender', 'Erkek') ? '☑' : '☐'} Erkek
                        </span>
                      </div>
                      <span className="text-[10px] text-purple-700 block mt-0.5 leading-tight">*Kadın cinsiyette pik plazma kons. önemlidir</span>
                    </div>
                    <div>
                      <span className="text-slate-600 font-bold block mb-1">Vücut Ağırlığı (kg):</span>
                      <div className="border border-slate-300 bg-slate-50/50 rounded-lg h-8 px-2 flex items-center font-bold text-slate-900">
                        {filledData?.weightKg ? `${filledData.weightKg} kg` : '_______ kg'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600 font-bold block mb-1">Boy / VKİ:</span>
                      <div className="border border-slate-300 bg-slate-50/50 rounded-lg h-8 px-2 flex items-center font-bold text-slate-900">
                        {filledData?.heightCm
                          ? `${filledData.heightCm} cm ${filledData.weightKg ? `/ ${(Number(filledData.weightKg) / Math.pow(Number(filledData.heightCm)/100, 2)).toFixed(1)} kg/m²` : ''}`
                          : '___ cm / ___ kg/m²'}
                      </div>
                    </div>
                  </div>

                  {/* Indication */}
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-700 font-bold block mb-2">Apixaban Kullanım Endikasyonunuz Nedir?</span>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{isMatch('indication', 'Atriyal Fibrilasyon') ? '☑' : '☐'}</span>
                        <span className={isMatch('indication', 'Atriyal Fibrilasyon') ? 'font-bold text-slate-900' : ''}>
                          Atriyal Fibrilasyon (AF) (İnme / sistemik emboli önlenmesi)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{isMatch('indication', 'Derin Ven Trombozu') ? '☑' : '☐'}</span>
                        <span className={isMatch('indication', 'Derin Ven Trombozu') ? 'font-bold text-slate-900' : ''}>
                          Derin Ven Trombozu (DVT) veya Akciğer Embolisi (PE) tedavisi
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{isMatch('indication', 'Ortopedik cerrahi') ? '☑' : '☐'}</span>
                        <span className={isMatch('indication', 'Ortopedik cerrahi') ? 'font-bold text-slate-900' : ''}>
                          Ortopedik cerrahi sonrası tromboz koruması
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{isMatch('indication', 'Diğer') ? '☑' : '☐'}</span>
                        <span>Diğer: {isMatch('indication', 'Diğer') ? (filledData?.indication || '') : '____________________________________'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BÖLÜM 2 */}
              <div className="border border-slate-300 rounded-xl overflow-hidden mb-5">
                <div className="bg-slate-800 text-white px-4 py-2 font-bold text-xs flex justify-between items-center">
                  <span>BÖLÜM 2: Apixaban Kullanım ve Uyum Detayları</span>
                  <span className="text-slate-300 text-[11px] font-normal">Dozaj & İlaç Sadakati</span>
                </div>

                <div className="p-4 grid grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-700 font-bold block mb-1.5">Günlük Apixaban Dozunuz Nedir?</span>
                      <div className="space-y-1.5 pl-1">
                        <div className="flex items-center gap-2">
                          <span>{isMatch('apixabanDose', '2.5 mg') ? '☑' : '☐'}</span>
                          <span className={isMatch('apixabanDose', '2.5 mg') ? 'font-bold text-slate-900' : ''}>Günde 2 kez 2.5 mg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{isMatch('apixabanDose', '5 mg') ? '☑' : '☐'}</span>
                          <span className={isMatch('apixabanDose', '5 mg') ? 'font-bold text-slate-900' : ''}>Günde 2 kez 5 mg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{isMatch('apixabanDose', 'Diğer') ? '☑' : '☐'}</span>
                          <span>Diğer: {isMatch('apixabanDose', 'Diğer') ? (filledData?.apixabanDose || '') : '________________________________'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-700 font-bold block mb-1">Apixaban Tedavisine Ne Zaman Başladınız?</span>
                      <div className="border-b-2 border-slate-300 h-7 flex items-end font-bold text-slate-900">
                        {filledData?.treatmentStartDate || '(Tarih / Kaç aydır?): _________________________'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-700 font-bold block mb-1.5">İlacınızı Düzenli Alıyor musunuz? (İlaç Uyumu)</span>
                      <div className="space-y-1.5 pl-1">
                        <div className="flex items-center gap-2">
                          <span>{isMatch('complianceLevel', 'Her gün') ? '☑' : '☐'}</span>
                          <span className={isMatch('complianceLevel', 'Her gün') ? 'font-bold text-slate-900' : ''}>
                            1. Her gün zamanında alıyorum (Tam uyum)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{isMatch('complianceLevel', 'Haftada 1-2') ? '☑' : '☐'}</span>
                          <span className={isMatch('complianceLevel', 'Haftada 1-2') ? 'font-bold text-slate-900' : ''}>
                            2. Haftada 1-2 doz unutuyorum
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{isMatch('complianceLevel', 'Sık sık') ? '☑' : '☐'}</span>
                          <span className={isMatch('complianceLevel', 'Sık sık') ? 'font-bold text-slate-900' : ''}>
                            3. Sık sık doz atlıyorum
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* LAST DOSE TIME (CRITICAL HIGHLIGHT BOX) */}
                    <div className="p-3 bg-purple-50 border-2 border-purple-300 rounded-xl">
                      <span className="text-purple-950 font-black block text-xs mb-1">
                        * Son Apixaban Dozunu Saat Kaçta Aldınız? *
                      </span>
                      <p className="text-[10px] text-purple-800 mb-2 leading-tight">
                        Kan alma ve pik/vadi plazma konsantrasyonu düzeyi tayini için gereklidir.
                      </p>
                      <div className="font-black text-sm text-purple-950 flex items-center gap-2">
                        <span>Saat:</span>
                        <div className="border-2 border-purple-400 bg-white rounded-lg px-4 py-1 text-base tracking-widest font-mono text-purple-950 font-bold">
                          {filledData?.lastDoseTime || '___ : ___'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BÖLÜM 3 */}
              <div className="border border-slate-300 rounded-xl overflow-hidden mb-3">
                <div className="bg-slate-800 text-white px-4 py-2 font-bold text-xs flex justify-between items-center">
                  <span>BÖLÜM 3: Eşzamanlı İlaç Kullanımı ve Etkileşim Taraması</span>
                  <span className="text-slate-300 text-[11px] font-normal">CYP3A4 ve P-glikoprotein Yolakları</span>
                </div>

                <div className="p-4 space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="text-slate-700 font-bold block mb-1.5">
                        Düzenli Kan Sulandırıcı / Pıhtı Önleyici Başka Bir İlaç:
                      </span>
                      <div className="space-y-1 pl-1">
                        <div className="flex items-center gap-2"><span>{isMatch('otherAnticoagulant', 'Hayır') ? '☑' : '☐'}</span><span>Hayır (Kullanmıyor)</span></div>
                        <div className="flex items-center gap-2"><span>{isMatch('otherAnticoagulant', 'Aspirin') ? '☑' : '☐'}</span><span>Aspirin</span></div>
                        <div className="flex items-center gap-2"><span>{isMatch('otherAnticoagulant', 'Klopidogrel') ? '☑' : '☐'}</span><span>Klopidogrel / Prasugrel / Tikagrelor</span></div>
                        <div className="flex items-center gap-2"><span>{isMatch('otherAnticoagulant', 'Heparin') ? '☑' : '☐'}</span><span>Heparin / Düşük Molekül Ağırlıklı Heparin</span></div>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-700 font-bold block mb-1.5">
                        Ağrı Kesici / Romatizma İlacı (NSAİİ - İbuprofen, Naproksen vb.):
                      </span>
                      <div className="space-y-1.5 pl-1">
                        <div className="flex items-center gap-2"><span>{isMatch('nsaidUse', 'Hayır') ? '☑' : '☐'}</span><span>Hayır</span></div>
                        <div className="flex items-center gap-2"><span>{isMatch('nsaidUse', 'Düzenli') ? '☑' : '☐'}</span><span>Evet &rarr; Düzenli her gün alıyorum</span></div>
                        <div className="flex items-center gap-2"><span>{isMatch('nsaidUse', 'Seyrek') ? '☑' : '☐'}</span><span>Evet &rarr; İhtiyaç halinde / Seyrek alıyorum</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-6">
                    <div>
                      <span className="text-slate-700 font-bold block mb-1">
                        CYP3A4 ve P-gp İnhibitörleri (Konsantrasyonu Artıranlar - Son 1 Ay):
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-[11px] pl-1">
                        <div>{isMatch('cyp3a4PgpInhibitors', 'Amiodaron') ? '☑' : '☐'} Amiodaron</div>
                        <div>{isMatch('cyp3a4PgpInhibitors', 'Verapamil') ? '☑' : '☐'} Verapamil</div>
                        <div>{isMatch('cyp3a4PgpInhibitors', 'Diltiazem') ? '☑' : '☐'} Diltiazem</div>
                        <div>{isMatch('cyp3a4PgpInhibitors', 'Ketokonazol') ? '☑' : '☐'} Ketokonazol / İtrakonazol</div>
                        <div>{isMatch('cyp3a4PgpInhibitors', 'Klaritromisin') ? '☑' : '☐'} Klaritromisin / Eritromisin</div>
                        <div className="font-bold text-slate-700">{isMatch('cyp3a4PgpInhibitors', 'Hiçbiri') ? '☑' : '☐'} Hiçbiri</div>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-700 font-bold block mb-1">
                        Güçlü Enzim İndükleyicileri (Konsantrasyonu Düşürenler - Son 1 Ay):
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-[11px] pl-1">
                        <div>{isMatch('cyp3a4Inducers', 'Rifampisin') ? '☑' : '☐'} Rifampisin</div>
                        <div>{isMatch('cyp3a4Inducers', 'Karbamazepin') ? '☑' : '☐'} Karbamazepin</div>
                        <div>{isMatch('cyp3a4Inducers', 'Fenitoin') ? '☑' : '☐'} Fenitoin</div>
                        <div>{isMatch('cyp3a4Inducers', 'Sarı Kantaron') ? '☑' : '☐'} Sarı Kantaron (St. John's Wort)</div>
                        <div className="col-span-2 font-bold text-slate-700">{isMatch('cyp3a4Inducers', 'Hiçbiri') ? '☑' : '☐'} Hiçbiri</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom footer note */}
              <div className="pt-2 text-center text-[10px] text-slate-400 font-mono">
                Adnan Tez Formu • Apixaban Farmakogenetik Klinik Araştırma Protokolü  |  Sayfa 1 / 2
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* A4 PAGE 2 CONTAINER */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'page2') && (
            <div className="max-w-[850px] mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-300 print:border-none print:shadow-none print:p-8 print:m-0">
              
              {/* Page 2 Top Header */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    ADNAN TEZ FORMU • BÖLÜM 4, 5 VE 6 {isFilled && `(${filledData?.protocolNo || 'Kayıt'})`}
                  </h2>
                  <p className="text-xs text-slate-500">
                    ISTH Kriterlerine Göre Kanama Belirtilerinin Taraması, Klinik Sonuçlar ve Araştırmacı Onayı
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-purple-900 bg-purple-100 px-3 py-1 rounded-md">
                    * Mor Tüp Kan Alınacak *
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 font-mono">Sayfa 2 / 2</span>
                </div>
              </div>

              {/* BÖLÜM 4: ORGAN SİSTEMLERİNE GÖRE KANAMA MATRIX TABLE */}
              <div className="border border-slate-300 rounded-xl overflow-hidden mb-5">
                <div className="bg-slate-800 text-white px-4 py-2 font-bold text-xs flex justify-between items-center">
                  <span>BÖLÜM 4: Organ Sistemlerine Göre Kanama Belirtilerinin Taraması</span>
                  <span className="text-slate-300 text-[11px] font-normal">ISTH Sınıflandırma Taraması</span>
                </div>

                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <tr>
                      <th className="py-2 px-3 w-[48%]">Kanama Belirtisi & Anatomik Bölge</th>
                      <th className="py-2 px-3 w-16 text-center border-x border-slate-200">Hayır</th>
                      <th className="py-2 px-3">Evet (Klinik Detay / Şiddet / Süre)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {/* A. Cilt & Mukoza */}
                    <tr className="bg-slate-50/70 font-bold text-[11px] text-slate-700">
                      <td colSpan={3} className="py-1 px-3">A. Cilt ve Yüzeyel / Mukoza Kanamaları (Minör Kanamalar)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-800">1. Sebepsiz veya kolayca ciltte morarma / mor lekeler (Ekimoz)</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('skinBruising') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3">{isYes('skinBruising') ? '☑' : '☐'} Evet &nbsp;&nbsp; ( {isMatch('skinBruising', '<2 cm') ? '☑' : '☐'} Küçük &lt;2 cm &nbsp;&nbsp;&nbsp;&nbsp; {isMatch('skinBruising', '>5 cm') ? '☑' : '☐'} Geniş / Yaygın &gt;5 cm )</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-800">2. Diş fırçalarken veya kendiliğinden diş eti kanaması</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('gingivalBleeding') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3">{isYes('gingivalBleeding') ? '☑' : '☐'} Evet &nbsp;&nbsp; ( {isMatch('gingivalBleeding', '<5 dakika') ? '☑' : '☐'} Süresi &lt;5 dakika &nbsp;&nbsp;&nbsp;&nbsp; {isMatch('gingivalBleeding', '>5 dakika') ? '☑' : '☐'} Süresi &gt;5 dakika / Zor duruyor )</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-800">3. Burun kanaması (Epistaksis)</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('epistaxis') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3">{isYes('epistaxis') ? '☑' : '☐'} Evet &nbsp;&nbsp; ( Sıklık: {isMatch('epistaxis', 'Ayda 1-2') ? '☑' : '☐'} Ayda 1-2 &nbsp; {isMatch('epistaxis', 'Haftalık') ? '☑' : '☐'} Haftalık | Durma: {isMatch('epistaxis', '<10 dk') ? '☑' : '☐'} &lt;10 dk &nbsp; {isMatch('epistaxis', '>10 dk') ? '☑' : '☐'} &gt;10 dk )</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-800">4. Küçük kesiklerde veya tıraşta normalden uzun süren kanama</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('cutsProlongedBleeding') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3">{isYes('cutsProlongedBleeding') ? '☑' : '☐'} Evet</td>
                    </tr>

                    {/* B. Gastrointestinal */}
                    <tr className="bg-rose-50/80 font-bold text-[11px] text-rose-900 border-t-2 border-rose-200">
                      <td colSpan={3} className="py-1 px-3">B. Gastrointestinal Sistem Kanamaları (GİS - Majör / CRNMB Şüphesi)</td>
                    </tr>
                    <tr className="hover:bg-rose-50/30">
                      <td className="py-2 px-3 font-semibold text-rose-950">5. Dışkının renginde siyahlaşma, katran gibi cıvık dışkılama (Melena)</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('melena') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3 font-semibold text-rose-900">{isYes('melena') ? '☑' : '☐'} Evet &nbsp;&nbsp; (Gastrointestinal Kanama Şüphesi)</td>
                    </tr>
                    <tr className="hover:bg-rose-50/30">
                      <td className="py-2 px-3 font-semibold text-rose-950">6. Tuvalette veya dışkıda parlak kırmızı renkli taze kan (Hematokezya)</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('hematochezia') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3">{isYes('hematochezia') ? '☑' : '☐'} Evet</td>
                    </tr>
                    <tr className="hover:bg-rose-50/30">
                      <td className="py-2 px-3 font-semibold text-rose-950">7. Kusma ile birlikte taze kan veya kahve telvesi parçacıklar (Hematemez)</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('hematemesis') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3">{isYes('hematemesis') ? '☑' : '☐'} Evet</td>
                    </tr>

                    {/* C. Ürogenital */}
                    <tr className="bg-slate-50/70 font-bold text-[11px] text-slate-700 border-t border-slate-200">
                      <td colSpan={3} className="py-1 px-3">C. Ürogenital Sistem Kanamaları</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-800">8. İdrar renginizde pembe, kırmızı veya çay rengi değişme (Hematüri)</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('hematuria') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3">{isYes('hematuria') ? '☑' : '☐'} Evet</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-800">9. (Kadın Hastalar) Adet kanamasında aşırı artış (Menoraji)</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('menorrhagia') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3">{isYes('menorrhagia') ? '☑' : '☐'} Evet &nbsp;&nbsp;&nbsp;&nbsp; {isMatch('menorrhagia', 'Uygulanamaz') ? '☑' : '☐'} Menopozda / Uygulanamaz</td>
                    </tr>

                    {/* D. SSS / Nörolojik */}
                    <tr className="bg-rose-50/80 font-bold text-[11px] text-rose-900 border-t-2 border-rose-200">
                      <td colSpan={3} className="py-1 px-3">D. Santral Sinir Sistemi / Nörolojik Belirtiler (Majör Kanama Şüphesi)</td>
                    </tr>
                    <tr className="hover:bg-rose-50/30">
                      <td className="py-2 px-3 font-semibold text-rose-950">10. Aniden başlayan hayatınızdaki en şiddetli baş ağrısı</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('severeHeadache') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3 font-semibold text-rose-900">{isYes('severeHeadache') ? '☑' : '☐'} Evet &nbsp;&nbsp; (Acil İntrakraniyal Kanama Şüphesi)</td>
                    </tr>
                    <tr className="hover:bg-rose-50/30">
                      <td className="py-2 px-3 font-semibold text-rose-950">11. Ani baş dönmesi, görme bozukluğu, konuşma güçlüğü veya uyuşma</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('neurologicalSymptoms') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3">{isYes('neurologicalSymptoms') ? '☑' : '☐'} Evet</td>
                    </tr>

                    {/* E. Kas & Eklem */}
                    <tr className="bg-slate-50/70 font-bold text-[11px] text-slate-700 border-t border-slate-200">
                      <td colSpan={3} className="py-1 px-3">E. Kas, Eklem ve Derin Doku Kanamaları</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-800">12. Darbe almadan eklem yerlerinde ani şişlik, kızarıklık, ağrı (Hemartroz)</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('hemarthrosis') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3">{isYes('hemarthrosis') ? '☑' : '☐'} Evet</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-800">13. Öksürükle ağızdan kan veya kanlı balgam gelmesi (Hemoptizi)</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('hemoptysis') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3">{isYes('hemoptysis') ? '☑' : '☐'} Evet</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-800">14. Göz içinde belirgin kan oturması / subkonjonktival kanama</td>
                      <td className="py-2 px-3 text-center border-x border-slate-200 font-bold">{isNo('ocularBleeding') ? '☑' : '☐'}</td>
                      <td className="py-2 px-3">{isYes('ocularBleeding') ? '☑' : '☐'} Evet</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* BÖLÜM 5 & 6 (SPACIOUS 2-COLUMN BOXES) */}
              <div className="grid grid-cols-2 gap-5 mb-5">
                
                {/* BÖLÜM 5 */}
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <div className="bg-slate-800 text-white px-4 py-2 font-bold text-xs">
                    BÖLÜM 5: Kanama Şiddeti ve Klinik Sonuçlar
                  </div>
                  <div className="p-3.5 space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">1. Sağlık Kuruluşuna Başvuru:</span>
                      <div className="space-y-1 pl-1">
                        <div>{isNo('hospitalVisit') ? '☑' : '☐'} Hayır</div>
                        <div>{isYes('hospitalVisit') ? '☑' : '☐'} Evet &rarr; &nbsp; {isMatch('hospitalVisit', 'Poliklinik') ? '☑' : '☐'} Poliklinik &nbsp;&nbsp; {isMatch('hospitalVisit', 'Acil') ? '☑' : '☐'} Acil &nbsp;&nbsp; {isMatch('hospitalVisit', 'Yatış') ? '☑' : '☐'} Yatış</div>
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">2. Kan Transfüzyonu (Eritrosit / Plazma):</span>
                      <div className="flex items-center gap-4 pl-1">
                        <div>{isNo('transfusionReceived') ? '☑' : '☐'} Hayır</div>
                        <div>{isYes('transfusionReceived') ? '☑' : '☐'} Evet &rarr; {filledData?.transfusionReceived || 'Ünite: ___________'}</div>
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">3. Apixaban Tedavisine Ara Verilmesi:</span>
                      <div className="flex items-center gap-4 pl-1">
                        <div>{isNo('treatmentInterruption') ? '☑' : '☐'} Hayır</div>
                        <div>{isYes('treatmentInterruption') ? '☑' : '☐'} Evet &rarr; {filledData?.treatmentInterruption || 'Ara Süresi: ________ gün'}</div>
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">4. Hb Belirgin Düşüş (&gt;2 g/dL):</span>
                      <div className="flex items-center gap-4 pl-1">
                        <div>{isNo('hbDrop') ? '☑' : '☐'} Hayır</div>
                        <div>{isYes('hbDrop') ? '☑' : '☐'} Evet</div>
                        <div>{isMatch('hbDrop', 'Bilinmiyor') ? '☑' : '☐'} Bilinmiyor</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BÖLÜM 6 */}
                <div className="border border-slate-300 rounded-xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-slate-800 text-white px-4 py-2 font-bold text-xs">
                      BÖLÜM 6: Zamansal İlişki
                    </div>
                    <div className="p-3.5 space-y-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">1. Kanamaya Kadar Geçen Süre:</span>
                        <p className="text-[11px] text-slate-500 mb-1">İlk kanama ilaca başladıktan ne kadar süre sonra çıktı?</p>
                        <div className="border-b-2 border-slate-300 h-6 flex items-end font-bold text-slate-900">
                          {filledData?.bleedingOnsetTime || ''}
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">2. Kanama Günü Doz Durumu:</span>
                        <div className="space-y-1 pl-1">
                          <div>{isMatch('doseTimingOnBleedingDay', 'Zamanında') ? '☑' : '☐'} Zamanında ve normal doz aldım</div>
                          <div>{isMatch('doseTimingOnBleedingDay', 'çift doz') ? '☑' : '☐'} Unutup çift doz almıştım</div>
                          <div>{isMatch('doseTimingOnBleedingDay', 'hemen sonra') ? '☑' : '☐'} İlaçtan hemen sonra kanama oldu</div>
                          <div>{isMatch('doseTimingOnBleedingDay', 'Kanama yaşanmadı') ? '☑' : '☐'} Kanama yaşanmadı / Uygulanamaz</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Physician Signature Block */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">Araştırmacı Hekim Onay & İmza:</span>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Hekim Adı Soyadı:</span>
                        <div className="border-b border-slate-400 h-5"></div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">İmza & Kaşe:</span>
                        <div className="border-b border-slate-400 h-5"></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom footer note */}
              <div className="pt-2 text-center text-[10px] text-slate-400 font-mono">
                Adnan Tez Formu • Apixaban Farmakogenetik Klinik Araştırma Protokolü  |  Sayfa 2 / 2
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Footer (Hidden when printed) */}
        <div className="print:hidden p-3.5 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Form 2 sayfadan oluşmaktadır. Yazıcıdan A4 çift taraflı veya 2 sayfa olarak alabilirsiniz.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isFilled ? 'Hasta PDF İndir' : 'PDF İndir'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
