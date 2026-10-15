import React, { useState } from 'react';
import {
  Save,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Flame,
  Check,
  CheckCircle,
  Printer,
  Download
} from 'lucide-react';
import { CLINICAL_SECTIONS } from '../defaultQuestions';
import { QuestionDefinition, ClinicalSectionKey } from '../types';
import { savePatientToFirestore } from '../firebase';
import { exportBlankFormPdf } from '../utils/exportUtils';
import { PrintableBlankFormModal } from './PrintableBlankFormModal';

interface PatientFormProps {
  questions: QuestionDefinition[];
  onBackToHome: () => void;
  onGoToAdmin: () => void;
  onPatientSaved: () => void;
}

// All fields start completely empty (NO pre-selected defaults)
const getEmptyFormData = (): Record<string, any> => ({
  protocolNo: '',
  age: '',
  gender: '',
  weightKg: '',
  heightCm: '',
  indication: '',

  apixabanDose: '',
  treatmentStartDate: '',
  complianceLevel: '',
  lastDoseTime: '',

  otherAnticoagulant: [],
  nsaidUse: '',
  cyp3a4PgpInhibitors: [],
  cyp3a4Inducers: [],

  skinBruising: '',
  gingivalBleeding: '',
  epistaxis: '',
  cutsProlongedBleeding: '',

  melena: '',
  hematochezia: '',
  hematemesis: '',

  hematuria: '',
  menorrhagia: '',

  severeHeadache: '',
  neurologicalSymptoms: '',

  hemarthrosis: '',
  hemoptysis: '',
  ocularBleeding: '',

  hospitalVisit: '',
  transfusionReceived: '',
  treatmentInterruption: '',
  hbDrop: '',

  bleedingOnsetTime: '',
  doseTimingOnBleedingDay: ''
});

export const PatientForm: React.FC<PatientFormProps> = ({
  questions,
  onBackToHome,
  onGoToAdmin,
  onPatientSaved
}) => {
  // Empty form data - nothing pre-selected
  const [formData, setFormData] = useState<Record<string, any>>(getEmptyFormData);

  // Active section index (0 to 5)
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);

  // Validation state: IDs of fields that are missing
  const [errorFieldIds, setErrorFieldIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccessModal, setSavedSuccessModal] = useState<{ id: string; protocol: string } | null>(null);
  const [connectionErrorModal, setConnectionErrorModal] = useState<string | null>(null);
  const [isBlankFormModalOpen, setIsBlankFormModalOpen] = useState(false);
  const [isFilledFormModalOpen, setIsFilledFormModalOpen] = useState(false);

  const currentSection = CLINICAL_SECTIONS[activeSectionIndex];

  // Handle single field change
  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errorFieldIds.includes(fieldId)) {
      setErrorFieldIds(prev => prev.filter(id => id !== fieldId));
    }
  };

  // Handle checkbox multi-selection
  const handleCheckboxToggle = (fieldId: string, option: string) => {
    const current = Array.isArray(formData[fieldId]) ? [...formData[fieldId]] : [];
    let updated: string[];

    if (option === 'Hiçbiri' || option === 'Hayır') {
      updated = [option];
    } else {
      const filtered = current.filter(item => item !== 'Hiçbiri' && item !== 'Hayır');
      if (filtered.includes(option)) {
        updated = filtered.filter(item => item !== option);
      } else {
        updated = [...filtered, option];
      }
    }

    setFormData(prev => ({ ...prev, [fieldId]: updated }));
    if (errorFieldIds.includes(fieldId)) {
      setErrorFieldIds(prev => prev.filter(id => id !== fieldId));
    }
  };

  // Validate form
  const validateForm = (): string[] => {
    const missing: string[] = [];
    questions.forEach(q => {
      if (q.required) {
        const val = formData[q.id];
        let isEmpty = false;
        if (val === undefined || val === null || val === '') {
          isEmpty = true;
        } else if (Array.isArray(val) && val.length === 0) {
          isEmpty = true;
        } else if (typeof val === 'string' && val.trim() === '') {
          isEmpty = true;
        }

        if (isEmpty) {
          missing.push(q.id);
        }
      }
    });
    return missing;
  };

  // Submit to Firestore
  const handleSaveForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const missing = validateForm();

    if (missing.length > 0) {
      setErrorFieldIds(missing);

      // Automatically jump to the section containing the first missing question so user doesn't need to scroll!
      const firstMissingId = missing[0];
      const targetQuestion = questions.find(q => q.id === firstMissingId);
      if (targetQuestion) {
        const sectionIdx = CLINICAL_SECTIONS.findIndex(s => s.key === targetQuestion.section);
        if (sectionIdx !== -1) {
          setActiveSectionIndex(sectionIdx);
        }
      }
      return;
    }

    setConnectionErrorModal(null);
    setIsSubmitting(true);
    try {
      const res = await savePatientToFirestore(formData);
      setIsSubmitting(false);
      setSavedSuccessModal({
        id: res.id,
        protocol: formData.protocolNo || 'Kayıt'
      });
      onPatientSaved();
    } catch (err) {
      console.error('Firestore save failed:', err);
      setIsSubmitting(false);
      setConnectionErrorModal("İnternet bağlantı hatası! Veriler sunucuya kaydedilemedi.");
    }
  };

  // Sample data quick fill
  const handleAutoFillSample = () => {
    const randomProt = '35' + Math.floor(100000000 + Math.random() * 900000000);
    setFormData({
      protocolNo: randomProt,
      age: '71',
      gender: 'Kadın',
      weightKg: '64',
      heightCm: '162',
      indication: 'Atriyal Fibrilasyon (İnme / sistemik emboli önlenmesi)',

      apixabanDose: 'Günde 2 kez 5 mg',
      treatmentStartDate: '6 aydır',
      complianceLevel: 'Her gün zamanında alıyorum',
      lastDoseTime: '08:15',

      otherAnticoagulant: ['Hayır'],
      nsaidUse: 'Hayır',
      cyp3a4PgpInhibitors: ['Hiçbiri'],
      cyp3a4Inducers: ['Hiçbiri'],

      skinBruising: 'Evet (Küçük <2 cm)',
      gingivalBleeding: 'Evet (Süresi <5 dakika)',
      epistaxis: 'Hayır',
      cutsProlongedBleeding: 'Hayır',

      melena: 'Hayır',
      hematochezia: 'Hayır',
      hematemesis: 'Hayır',

      hematuria: 'Hayır',
      menorrhagia: 'Menopozda / Uygulanamaz',

      severeHeadache: 'Hayır',
      neurologicalSymptoms: 'Hayır',

      hemarthrosis: 'Hayır',
      hemoptysis: 'Hayır',
      ocularBleeding: 'Hayır',

      hospitalVisit: 'Hayır',
      transfusionReceived: 'Hayır',
      treatmentInterruption: 'Hayır',
      hbDrop: 'Hayır',

      bleedingOnsetTime: '1 ay sonra',
      doseTimingOnBleedingDay: 'Evet'
    });
    setErrorFieldIds([]);
  };

  const handleReset = () => {
    if (confirm('Tüm alanları sıfırlamak istediğinize emin misiniz?')) {
      setFormData(getEmptyFormData());
      setErrorFieldIds([]);
    }
  };

  // Completion calculation
  const totalRequired = questions.filter(q => q.required).length;
  const answeredRequired = questions.filter(q => {
    if (!q.required) return false;
    const v = formData[q.id];
    if (v === undefined || v === null || v === '') return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  }).length;
  const progressPercent = Math.round((answeredRequired / (totalRequired || 1)) * 100);

  // Active section questions
  const sectionQuestions = questions.filter(q => q.section === currentSection.key);

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 flex flex-col h-[calc(100vh-4.25rem)] justify-between overflow-hidden">
      
      {/* 1. TOP COMPACT HEADER BAR */}
      <div className="shrink-0 flex items-center justify-between gap-3 pb-2 border-b border-slate-200">
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ana Sayfa</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 border border-purple-300 text-purple-900 text-xs font-extrabold shadow-2xs">
            <i className="fa-solid fa-vial text-purple-600"></i>
            <span>Hastadan Mor Tüp Kan Alınacak</span>
          </div>
        </div>

        {/* Progress & Quick Tools */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700">{answeredRequired}/{totalRequired}</span>
            <div className="w-20 sm:w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-slate-700 hidden sm:inline">%{progressPercent}</span>
          </div>

          {/* Formu Yazdır / Çıktı Al (Doldurulan Veriler) */}
          <button
            type="button"
            onClick={() => setIsFilledFormModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
            title="Mevcut girilen form verilerini yazdır veya PDF olarak çıktı al"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Formu Yazdır / Çıktı Al</span>
            <span className="sm:hidden">Çıktı Al</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsBlankFormModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-100 text-purple-900 hover:bg-purple-200 border border-purple-300 transition-colors cursor-pointer shadow-2xs"
              title="Manuel elle doldurmak için boş formu önizle ve yazdır"
            >
              <Printer className="w-3.5 h-3.5 text-purple-700" />
              <span>Boş Form</span>
            </button>
            <button
              type="button"
              onClick={exportBlankFormPdf}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
              title="Boş formu doğrudan PDF olarak indir"
            >
              <Download className="w-3 h-3 text-purple-700" />
              <span>PDF İndir</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleAutoFillSample}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
            title="Örnek verilerle doldur"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span className="hidden sm:inline">Örnek Doldur</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            title="Formu Temizle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 2. SECTION TABS (6 CLICKABLE SHORTCUT TABS) */}
      <div className="shrink-0 grid grid-cols-6 gap-1.5 py-2">
        {CLINICAL_SECTIONS.map((sec, idx) => {
          const isActive = idx === activeSectionIndex;
          const secQuestions = questions.filter(q => q.section === sec.key);
          const hasError = secQuestions.some(q => errorFieldIds.includes(q.id));
          const isComplete = secQuestions.every(q => {
            if (!q.required) return true;
            const v = formData[q.id];
            if (v === undefined || v === null || v === '') return false;
            if (Array.isArray(v) && v.length === 0) return false;
            return true;
          });

          return (
            <button
              key={sec.key}
              type="button"
              onClick={() => setActiveSectionIndex(idx)}
              className={`p-1.5 sm:p-2 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/30'
                  : hasError
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                  BÖLÜM {idx + 1}
                </span>
                {hasError && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                )}
                {!hasError && isComplete && (
                  <CheckCircle className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                )}
              </div>
              <div className={`text-xs font-bold truncate mt-0.5 ${isActive ? 'text-white' : 'text-slate-800'}`}>
                {sec.title.split(': ')[1] || sec.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* ERROR NOTICE BANNER IF VALIDATION FAILED */}
      {errorFieldIds.length > 0 && (
        <div className="shrink-0 px-3 py-1.5 bg-rose-50 border border-rose-300 rounded-lg flex items-center justify-between text-xs text-rose-800 animate-pulse">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold">
              {errorFieldIds.length} adet zorunlu alan doldurulmadı. İlgili sorular kırmızı ile işaretlenmiştir.
            </span>
          </div>
          <span className="text-[11px] text-rose-600 font-semibold">Lütfen seçimlerinizi yapınız</span>
        </div>
      )}

      {/* 3. MAIN SECTION CARD (FIT IN SCREEN - NO PAGE SCROLLING NEEDED) */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between overflow-y-auto">
        
        {/* Section Heading Bar */}
        <div className="pb-2 mb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                {activeSectionIndex + 1}
              </span>
              <span>{currentSection.title}</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {currentSection.subtitle}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Adım {activeSectionIndex + 1} / 6
          </span>
        </div>

        {/* QUESTIONS CONTAINER - GRID LAYOUT TAILORED FOR MAXIMUM VISIBILITY */}
        <div className="flex-1 overflow-y-auto pr-1">

          {/* ===================== SECTION 1: DEMOGRAFİK ===================== */}
          {activeSectionIndex === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              {/* Left Column: Basic Demographics */}
              <div className="space-y-2.5">
                {/* Hasta TC */}
                <div id="question-box-protocolNo" className={`p-2 rounded-xl transition-all ${errorFieldIds.includes('protocolNo') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Hasta TC <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.protocolNo || ''}
                    onChange={(e) => handleChange('protocolNo', e.target.value)}
                    placeholder="Örn: 12345678901"
                    className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:border-indigo-600 outline-none"
                  />
                </div>

                {/* Yaş & Cinsiyet Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div id="question-box-age" className={`p-2 rounded-xl transition-all ${errorFieldIds.includes('age') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Yaşınız <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => handleChange('age', e.target.value)}
                      placeholder="Örn: 68"
                      className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:border-indigo-600 outline-none"
                    />
                  </div>

                  <div id="question-box-gender" className={`p-2 rounded-xl transition-all ${errorFieldIds.includes('gender') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Cinsiyet <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-1.5">
                      {['Kadın', 'Erkek'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleChange('gender', g)}
                          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs border text-center transition-all ${
                            formData.gender === g
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Kilo & Boy Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div id="question-box-weightKg" className={`p-2 rounded-xl transition-all ${errorFieldIds.includes('weightKg') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Kilo (kg) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.weightKg || ''}
                      onChange={(e) => handleChange('weightKg', e.target.value)}
                      placeholder="Örn: 72"
                      className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:border-indigo-600 outline-none"
                    />
                  </div>

                  <div id="question-box-heightCm" className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Boy (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.heightCm || ''}
                      onChange={(e) => handleChange('heightCm', e.target.value)}
                      placeholder="Örn: 170"
                      className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Indication */}
              <div className="space-y-2.5">
                {/* Endikasyon */}
                <div id="question-box-indication" className={`p-2 rounded-xl transition-all ${errorFieldIds.includes('indication') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Apixaban Kullanım Endikasyonunuz Nedir? <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-1">
                    {[
                      'Atriyal Fibrilasyon (İnme / sistemik emboli önlenmesi)',
                      'Derin Ven Trombozu (DVT) veya Akciğer Embolisi (PE) tedavisi / önlenmesi',
                      'Ortopedik cerrahi sonrası tromboz koruması',
                      'Diğer'
                    ].map(ind => (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => handleChange('indication', ind)}
                        className={`w-full py-1.5 px-2.5 rounded-lg text-left text-xs font-medium border transition-all ${
                          formData.indication === ind
                            ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ===================== SECTION 2: APİXABAN KULLANIM ===================== */}
          {activeSectionIndex === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              {/* Doz */}
              <div id="question-box-apixabanDose" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('apixabanDose') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Günlük Apixaban Dozunuz Nedir? <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {['Günde 2 kez 2.5 mg', 'Günde 2 kez 5 mg', 'Diğer'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleChange('apixabanDose', d)}
                      className={`w-full py-2 px-3 rounded-lg text-left text-xs font-semibold border transition-all ${
                        formData.apixabanDose === d
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* İlaç Uyumu */}
              <div id="question-box-complianceLevel" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('complianceLevel') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  İlacınızı Düzenli Alıyor musunuz? (İlaç Uyumu) <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {[
                    'Her gün zamanında alıyorum',
                    'Haftada 1-2 doz unutuyorum',
                    'Sık sık doz atlıyorum'
                  ].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleChange('complianceLevel', c)}
                      className={`w-full py-2 px-3 rounded-lg text-left text-xs font-semibold border transition-all ${
                        formData.complianceLevel === c
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tedaviye Başlama Tarihi */}
              <div id="question-box-treatmentStartDate" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('treatmentStartDate') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Apixaban Tedavisine Ne Zaman Başladınız? <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">Tarih veya kaç aydır kullanıyorsunuz?</p>
                <input
                  type="text"
                  value={formData.treatmentStartDate || ''}
                  onChange={(e) => handleChange('treatmentStartDate', e.target.value)}
                  placeholder="Örn: 6 aydır / Ocak 2024"
                  className="w-full bg-white px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:border-indigo-600 outline-none"
                />
              </div>

              {/* Son Doz Saati */}
              <div id="question-box-lastDoseTime" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('lastDoseTime') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Son Apixaban Dozunu Saat Kaçta Aldınız? <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-purple-700 font-medium mb-1.5">Kan alma ve plazma konsantrasyonu için gereklidir</p>
                <input
                  type="text"
                  value={formData.lastDoseTime || ''}
                  onChange={(e) => handleChange('lastDoseTime', e.target.value)}
                  placeholder="Örn: 08:30"
                  className="w-full bg-white px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold font-mono focus:border-indigo-600 outline-none"
                />
              </div>

            </div>
          )}

          {/* ===================== SECTION 3: EŞZAMANLI İLAÇLAR ===================== */}
          {activeSectionIndex === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              {/* Diğer Kan Sulandırıcı */}
              <div id="question-box-otherAnticoagulant" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('otherAnticoagulant') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Düzenli Kan Sulandırıcı Başka Bir İlaç Kullanıyor musunuz? <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Aspirin', 'Klopidogrel / Prasugrel / Tikagrelor', 'Heparin', 'Hayır'].map(med => {
                    const isSelected = Array.isArray(formData.otherAnticoagulant) && formData.otherAnticoagulant.includes(med);
                    return (
                      <button
                        key={med}
                        type="button"
                        onClick={() => handleCheckboxToggle('otherAnticoagulant', med)}
                        className={`p-2 rounded-lg text-left text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {med}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* NSAİİ Ağrı Kesici */}
              <div id="question-box-nsaidUse" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('nsaidUse') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Ağrı Kesici / Romatizma İlacı (NSAİİ) Kullanıyor musunuz? <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Örn: İbuprofen, Naproksen, Diklofenak vb.</p>
                <div className="space-y-1.5">
                  {['Hayır', 'Evet (Düzenli her gün)', 'Evet (İhtiyaç halinde / Seyrek)'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange('nsaidUse', opt)}
                      className={`w-full p-2 rounded-lg text-left text-xs font-semibold border transition-all ${
                        formData.nsaidUse === opt
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* CYP3A4 / P-gp İnhibitörleri */}
              <div id="question-box-cyp3a4PgpInhibitors" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('cyp3a4PgpInhibitors') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Güçlü/Orta CYP3A4 ve P-gp İnhibitörleri (Konsantrasyonu Artıranlar - Son 1 Ay) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
                  {['Amiodaron', 'Verapamil', 'Diltiazem', 'Ketokonazol / İtrakonazol', 'Klaritromisin / Eritromisin', 'Hiçbiri'].map(inh => {
                    const isSelected = Array.isArray(formData.cyp3a4PgpInhibitors) && formData.cyp3a4PgpInhibitors.includes(inh);
                    return (
                      <button
                        key={inh}
                        type="button"
                        onClick={() => handleCheckboxToggle('cyp3a4PgpInhibitors', inh)}
                        className={`p-1.5 rounded-lg text-center text-xs border font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 font-bold'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {inh}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CYP3A4 İndükleyicileri */}
              <div id="question-box-cyp3a4Inducers" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('cyp3a4Inducers') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Güçlü Enzim İndükleyicileri (Konsantrasyonu Düşürenler - Son 1 Ay) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
                  {['Rifampisin', 'Karbamazepin', 'Fenitoin', 'Sarı Kantaron (St. John\'s Wort)', 'Hiçbiri'].map(ind => {
                    const isSelected = Array.isArray(formData.cyp3a4Inducers) && formData.cyp3a4Inducers.includes(ind);
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => handleCheckboxToggle('cyp3a4Inducers', ind)}
                        className={`p-1.5 rounded-lg text-center text-xs border font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 font-bold'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {ind}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ===================== SECTION 4: ORGAN SİSTEMLERİNE GÖRE KANAMA ===================== */}
          {/* COMPACT 3-COLUMN CLINICAL MATRIX SO ALL 14 SYMPTOMS FIT ON ONE SCREEN! */}
          {activeSectionIndex === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              
              {/* Column A: Cilt ve Mukoza Kanamaları */}
              <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider block border-b pb-1">
                  A. Cilt & Mukoza Kanamaları
                </span>

                {/* 1. Morarma */}
                <div id="question-box-skinBruising" className={`p-1.5 rounded-lg ${errorFieldIds.includes('skinBruising') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    Kolayca Morarma / Ekimoz? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {['Hayır', 'Evet (<2 cm)', 'Evet (>5 cm)'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('skinBruising', opt)}
                        className={`py-1 px-1 rounded text-[10px] font-semibold border text-center transition-all ${
                          formData.skinBruising === opt
                            ? opt.includes('Evet') ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Diş Eti */}
                <div id="question-box-gingivalBleeding" className={`p-1.5 rounded-lg ${errorFieldIds.includes('gingivalBleeding') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    Diş Eti Kanaması? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {['Hayır', 'Evet (<5 dk)', 'Evet (>5 dk)'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('gingivalBleeding', opt)}
                        className={`py-1 px-1 rounded text-[10px] font-semibold border text-center transition-all ${
                          formData.gingivalBleeding === opt
                            ? opt.includes('Evet') ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Epistaksis */}
                <div id="question-box-epistaxis" className={`p-1.5 rounded-lg ${errorFieldIds.includes('epistaxis') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    Burun Kanaması (Epistaksis)? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {['Hayır', 'Evet (Ayda 1-2)', 'Evet (Haftalık)'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('epistaxis', opt)}
                        className={`py-1 px-1 rounded text-[10px] font-semibold border text-center transition-all ${
                          formData.epistaxis === opt
                            ? opt.includes('Evet') ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Kesiklerde Uzun Kanama */}
                <div id="question-box-cutsProlongedBleeding" className={`p-1.5 rounded-lg ${errorFieldIds.includes('cutsProlongedBleeding') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    Küçük Kesiklerde Uzun Kanama? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {['Hayır', 'Evet'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('cutsProlongedBleeding', opt)}
                        className={`py-1 px-2 rounded text-xs font-semibold border text-center transition-all ${
                          formData.cutsProlongedBleeding === opt
                            ? opt === 'Evet' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column B & C: Gastrointestinal & Ürogenital */}
              <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-black uppercase text-rose-700 tracking-wider block border-b pb-1">
                  B & C. GİS & Ürogenital Kanamalar
                </span>

                {/* Melena */}
                <div id="question-box-melena" className={`p-1.5 rounded-lg ${errorFieldIds.includes('melena') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    Melena (Siyah Katran Dışkı)? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {['Hayır', 'Evet'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('melena', opt)}
                        className={`py-1 px-2 rounded text-xs font-semibold border text-center transition-all ${
                          formData.melena === opt
                            ? opt === 'Evet' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hematokezya */}
                <div id="question-box-hematochezia" className={`p-1.5 rounded-lg ${errorFieldIds.includes('hematochezia') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    Hematokezya (Taze Kırmızı Kan)? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {['Hayır', 'Evet'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('hematochezia', opt)}
                        className={`py-1 px-2 rounded text-xs font-semibold border text-center transition-all ${
                          formData.hematochezia === opt
                            ? opt === 'Evet' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hematemez */}
                <div id="question-box-hematemesis" className={`p-1.5 rounded-lg ${errorFieldIds.includes('hematemesis') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    Hematemez (Kanlı Kusma)? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {['Hayır', 'Evet'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('hematemesis', opt)}
                        className={`py-1 px-2 rounded text-xs font-semibold border text-center transition-all ${
                          formData.hematemesis === opt
                            ? opt === 'Evet' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hematüri */}
                <div id="question-box-hematuria" className={`p-1.5 rounded-lg ${errorFieldIds.includes('hematuria') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    Hematüri (İdrarda Kan/Çay Rengi)? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {['Hayır', 'Evet'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('hematuria', opt)}
                        className={`py-1 px-2 rounded text-xs font-semibold border text-center transition-all ${
                          formData.hematuria === opt
                            ? opt === 'Evet' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menoraji */}
                <div id="question-box-menorrhagia" className={`p-1.5 rounded-lg ${errorFieldIds.includes('menorrhagia') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    Menoraji (Aşırı Adet Kanaması)? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {['Hayır', 'Evet', 'Menopozda'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('menorrhagia', opt)}
                        className={`py-1 px-1 rounded text-[10px] font-semibold border text-center transition-all ${
                          formData.menorrhagia === opt
                            ? opt === 'Evet' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column D & E: Nörolojik, Kas, Eklem & Göz */}
              <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-black uppercase text-purple-700 tracking-wider block border-b pb-1">
                  D & E. Nörolojik, Kas, Eklem & Göz
                </span>

                {/* Şiddetli Baş Ağrısı */}
                <div id="question-box-severeHeadache" className={`p-1.5 rounded-lg ${errorFieldIds.includes('severeHeadache') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    En Şiddetli Baş Ağrısı? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {['Hayır', 'Evet'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('severeHeadache', opt)}
                        className={`py-1 px-2 rounded text-xs font-semibold border text-center transition-all ${
                          formData.severeHeadache === opt
                            ? opt === 'Evet' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nörolojik Semptom */}
                <div id="question-box-neurologicalSymptoms" className={`p-1.5 rounded-lg ${errorFieldIds.includes('neurologicalSymptoms') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    Ani Baş Dönmesi/Görme/Uyuşma? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {['Hayır', 'Evet'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('neurologicalSymptoms', opt)}
                        className={`py-1 px-2 rounded text-xs font-semibold border text-center transition-all ${
                          formData.neurologicalSymptoms === opt
                            ? opt === 'Evet' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hemartroz */}
                <div id="question-box-hemarthrosis" className={`p-1.5 rounded-lg ${errorFieldIds.includes('hemarthrosis') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    Hemartroz (Eklem Şişliği / Ağrı)? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {['Hayır', 'Evet'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('hemarthrosis', opt)}
                        className={`py-1 px-2 rounded text-xs font-semibold border text-center transition-all ${
                          formData.hemarthrosis === opt
                            ? opt === 'Evet' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hemoptizi */}
                <div id="question-box-hemoptysis" className={`p-1.5 rounded-lg ${errorFieldIds.includes('hemoptysis') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    Hemoptizi (Kanlı Balgam)? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {['Hayır', 'Evet'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('hemoptysis', opt)}
                        className={`py-1 px-2 rounded text-xs font-semibold border text-center transition-all ${
                          formData.hemoptysis === opt
                            ? opt === 'Evet' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Göz İçi Kanama */}
                <div id="question-box-ocularBleeding" className={`p-1.5 rounded-lg ${errorFieldIds.includes('ocularBleeding') ? 'field-error-pulse' : ''}`}>
                  <label className="block text-[11px] font-bold text-slate-800 leading-tight mb-1">
                    Göz İçi Kan Oturması? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {['Hayır', 'Evet'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('ocularBleeding', opt)}
                        className={`py-1 px-2 rounded text-xs font-semibold border text-center transition-all ${
                          formData.ocularBleeding === opt
                            ? opt === 'Evet' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ===================== SECTION 5: KANAMA ŞİDDETİ VE SONUÇLAR ===================== */}
          {activeSectionIndex === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              {/* Hastane Başvurusu */}
              <div id="question-box-hospitalVisit" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('hospitalVisit') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Yaşadığınız Kanama Nedeniyle Bir Sağlık Kuruluşuna Başvurdunuz mu? <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {[
                    'Hayır',
                    'Evet (Poliklinik başvurusu)',
                    'Evet (Acil Servis başvurusu)',
                    'Evet (Hastaneye yatış yapıldı)'
                  ].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange('hospitalVisit', opt)}
                      className={`w-full py-2 px-3 rounded-lg text-left text-xs font-semibold border transition-all ${
                        formData.hospitalVisit === opt
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kan Transfüzyonu */}
              <div id="question-box-transfusionReceived" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('transfusionReceived') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Kanama Sonrasında Size Kan Transfüzyonu (Kan Verilmesi) Yapıldı mı? <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {['Hayır', 'Evet (1 Ünite)', 'Evet (2 Ünite)', 'Evet (≥3 Ünite)'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange('transfusionReceived', opt)}
                      className={`w-full py-2 px-3 rounded-lg text-left text-xs font-semibold border transition-all ${
                        formData.transfusionReceived === opt
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tedaviye Ara Verme */}
              <div id="question-box-treatmentInterruption" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('treatmentInterruption') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Kanama Nedeniyle Apixaban Tedavinize Ara Verildi mi / Kesildi mi? <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {[
                    'Hayır',
                    'Evet (1-3 gün ara verildi)',
                    'Evet (4-7 gün ara verildi)',
                    'Evet (>7 gün ara verildi veya kalıcı kesildi)'
                  ].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange('treatmentInterruption', opt)}
                      className={`w-full py-2 px-3 rounded-lg text-left text-xs font-semibold border transition-all ${
                        formData.treatmentInterruption === opt
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hemoglobin Düşüşü */}
              <div id="question-box-hbDrop" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('hbDrop') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Hb Değerinizde Belirgin Bir Düşüş (&gt;2 g/dL) Olduğu Söylendi mi? <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {['Hayır', 'Evet', 'Ölçülmedi / Bilinmiyor'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange('hbDrop', opt)}
                      className={`w-full py-2 px-3 rounded-lg text-left text-xs font-semibold border transition-all ${
                        formData.hbDrop === opt
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ===================== SECTION 6: ZAMANSAL İLİŞKİ ===================== */}
          {activeSectionIndex === 5 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              {/* Kanamaya Kadar Geçen Süre */}
              <div id="question-box-bleedingOnsetTime" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('bleedingOnsetTime') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  İlk Kanama Belirtisi Apixaban Başlandıktan Kaç Gün / Hafta Sonra Ortaya Çıktı? <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Şayet kanama yaşadıysanız belirtiniz</p>
                <input
                  type="text"
                  value={formData.bleedingOnsetTime || ''}
                  onChange={(e) => handleChange('bleedingOnsetTime', e.target.value)}
                  placeholder="Örn: 15 gün sonra / 3 hafta sonra / Kanama olmadı"
                  className="w-full bg-white px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:border-indigo-600 outline-none"
                />
              </div>

              {/* Kanama Günü Doz Alımı */}
              <div id="question-box-doseTimingOnBleedingDay" className={`p-3 rounded-xl transition-all ${errorFieldIds.includes('doseTimingOnBleedingDay') ? 'field-error-pulse' : 'bg-slate-50 border border-slate-200/80'}`}>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Kanamanın Olduğu Gün İlacınızı Normal Dozunda ve Saatinde Almış mıydınız? <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {[
                    'Evet',
                    'Unutup çift doz almıştım',
                    'İlacı aldıktan hemen sonra kanama oldu',
                    'Kanama yaşanmadı / Uygulanamaz'
                  ].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange('doseTimingOnBleedingDay', opt)}
                      className={`w-full py-2 px-3 rounded-lg text-left text-xs font-semibold border transition-all ${
                        formData.doseTimingOnBleedingDay === opt
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* 4. BOTTOM ACTION & STEP NAVIGATION BUTTONS (STICKY AT BOTTOM OF CARD) */}
        <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          
          {/* Previous Button */}
          <button
            type="button"
            disabled={activeSectionIndex === 0}
            onClick={() => setActiveSectionIndex(prev => Math.max(0, prev - 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Önceki Bölüm</span>
          </button>

          {/* Center Indicator */}
          <div className="text-[11px] text-slate-500 font-semibold hidden sm:block">
            {activeSectionIndex + 1}. Bölüm: <span className="text-slate-800 font-bold">{currentSection.title.split(': ')[1] || currentSection.title}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Next Button */}
            {activeSectionIndex < 5 && (
              <button
                type="button"
                onClick={() => setActiveSectionIndex(prev => Math.min(5, prev + 1))}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>Sonraki Bölüm</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Save Button (Always available or on final step) */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveForm()}
              className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Verileri Kaydet</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* SUCCESS MODAL */}
      {savedSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center">
            
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Kayıt Başarıyla Tamamlandı!
            </h3>
            
            <p className="text-xs text-slate-600 mt-1.5">
              <span className="font-bold text-purple-700">{savedSuccessModal.protocol}</span> kodlu hastanın verileri Cloud Firestore (<code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">patients</code>) koleksiyonuna başarıyla eklendi.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsFilledFormModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Kaydı Yazdır / Çıktı Al (PDF)</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSavedSuccessModal(null);
                    setFormData(getEmptyFormData());
                    setActiveSectionIndex(0);
                    setErrorFieldIds([]);
                  }}
                  className="w-1/2 py-2 px-3 rounded-xl border border-purple-600 text-purple-600 hover:bg-purple-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Yeni Hasta Ekle
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSavedSuccessModal(null);
                    onGoToAdmin();
                  }}
                  className="w-1/2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Yönetim Paneline Git
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONNECTION / FIRESTORE ERROR MODAL */}
      {connectionErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-rose-500 max-w-lg w-full p-6 text-center">
            
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-rose-50">
              <AlertCircle className="w-9 h-9 animate-pulse" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              İnternet Bağlantı Hatası!
            </h3>
            
            <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 font-bold text-sm">
              {connectionErrorModal}
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Cihazınızın internet bağlantısında veya Cloud Firestore sunucusuyla iletişimde bir kesinti meydana geldi. 
              <br />
              <b className="text-slate-900 font-bold">Girdiğiniz hiçbir veri silinmemiştir</b>. Verilerinizi kaybetmemek için hemen çıktısını alabilir (veya PDF olarak kaydedebilir), bağlantınızı kontrol ettikten sonra tekrar kaydedebilirsiniz.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsFilledFormModalOpen(true);
                }}
                className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Formu Yazdır / Çıktı Al</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConnectionErrorModal(null);
                  handleSaveForm();
                }}
                className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Tekrar Dene</span>
              </button>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={() => setConnectionErrorModal(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Kapat ve Formu İncele
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PRINTABLE BLANK FORM MODAL */}
      <PrintableBlankFormModal
        isOpen={isBlankFormModalOpen}
        onClose={() => setIsBlankFormModalOpen(false)}
      />

      {/* PRINTABLE FILLED PATIENT FORM MODAL */}
      <PrintableBlankFormModal
        isOpen={isFilledFormModalOpen}
        onClose={() => setIsFilledFormModalOpen(false)}
        filledData={formData}
      />

    </div>
  );
};
