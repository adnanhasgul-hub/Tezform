import React, { useState } from 'react';
import { X, Save, CheckCircle, Activity, ShieldCheck, Microscope } from 'lucide-react';
import { PatientRecord, updatePatientInFirestore } from '../firebase';

interface PatientCompleteModalProps {
  patient: PatientRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

const DVT_LEVEL_OPTIONS = ['İliak', 'Femoral', 'Popliteal', 'Üst Extremite', 'İVC', 'SVC', 'Juguler'];
const SIDE_OPTIONS = ['Sağ', 'Sol'];

const LAB_FIELDS = [
  { id: 'bun', label: 'BUN', placeholder: 'Örn: 18 mg/dL' },
  { id: 'creatinine', label: 'Kreatinin', placeholder: 'Örn: 0.9 mg/dL' },
  { id: 'egfr', label: 'eGFR', placeholder: 'Örn: 90 mL/dk' },
  { id: 'calcium', label: 'Kalsiyum (Serum/Plazma)', placeholder: 'Örn: 9.5 mg/dL' },
  { id: 'sodium', label: 'Sodyum', placeholder: 'Örn: 140 mEq/L' },
  { id: 'potassium', label: 'Potasyum', placeholder: 'Örn: 4.2 mEq/L' },
  { id: 'totalBilirubin', label: 'Total Bilirubin', placeholder: 'Örn: 0.8 mg/dL' },
  { id: 'directBilirubin', label: 'Direk Bilirubin', placeholder: 'Örn: 0.2 mg/dL' },
  { id: 'ast', label: 'AST', placeholder: 'Örn: 22 U/L' },
  { id: 'alt', label: 'ALT', placeholder: 'Örn: 25 U/L' },
  { id: 'totalProtein', label: 'Total Protein', placeholder: 'Örn: 7.2 g/dL' },
  { id: 'albumin', label: 'Albümin', placeholder: 'Örn: 4.4 g/dL' },
  { id: 'wbc', label: 'WBC (Beyaz Küre)', placeholder: 'Örn: 7.5 K/uL' },
  { id: 'hgb', label: 'HGB (Hemoglobin)', placeholder: 'Örn: 14.0 g/dL' },
  { id: 'plt', label: 'PLT (Platelet)', placeholder: 'Örn: 250 K/uL' },
  { id: 'hct', label: 'HCT (Hematokrit)', placeholder: 'Örn: 42%' },
  { id: 'pt', label: 'PT (Protrombin Zamanı)', placeholder: 'Örn: 12 sn' },
  { id: 'ptInr', label: 'PT INR', placeholder: 'Örn: 1.0' },
  { id: 'aptt', label: 'aPTT', placeholder: 'Örn: 28 sn' },
];

export const PatientCompleteModal: React.FC<PatientCompleteModalProps> = ({
  patient,
  onClose,
  onSaved
}) => {
  if (!patient) return null;

  const [formData, setFormData] = useState<Record<string, any>>({
    ...patient,
    dvtLevel: Array.isArray(patient.dvtLevel) ? patient.dvtLevel : [],
    dvtSide: Array.isArray(patient.dvtSide) ? patient.dvtSide : [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCheckboxToggle = (field: 'dvtLevel' | 'dvtSide', option: string) => {
    const current = Array.isArray(formData[field]) ? [...formData[field]] : [];
    let updated: string[];
    if (current.includes(option)) {
      updated = current.filter(item => item !== option);
    } else {
      updated = [...current, option];
    }
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const handleLabChange = (fieldId: string, val: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient.id) return;

    setIsSaving(true);
    try {
      await updatePatientInFirestore(patient.id, formData);
      setIsSaving(false);
      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 700);
    } catch (err) {
      setIsSaving(false);
      alert('Güncelleme başarısız: ' + String(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-indigo-900 p-5 text-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-800 flex items-center justify-center text-indigo-200">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Hasta Formunu Tamamla / Detay Ekle</h3>
              <p className="text-xs text-indigo-200">
                Hasta TC / Protokol: <span className="font-mono font-bold text-white">{patient.protocolNo || patient.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-indigo-200 hover:text-white rounded-xl hover:bg-indigo-800/80 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">Radyoloji ve Laboratuvar verileri Firestore'da başarıyla güncellendi!</span>
            </div>
          )}

          {/* 1. RADYOLOJİ BULGULARI */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-xs">
                1. Radyoloji Bulguları (DVT Seviyesi ve Taraf)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* DVT Seviyesi (Çoklu Seçim) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  DVT Seviyesi <span className="text-slate-400 font-normal">(Birden fazla seçilebilir)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DVT_LEVEL_OPTIONS.map(opt => {
                    const isSelected = (formData.dvtLevel || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleCheckboxToggle('dvtLevel', opt)}
                        className={`px-3 py-2 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span>{opt}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'border-white bg-indigo-500' : 'border-slate-300 bg-white'}`}>
                          {isSelected && <span className="text-[10px] text-white font-bold">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hangi Taraf (Çoklu Seçim) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Hangi Taraf <span className="text-slate-400 font-normal">(Birden fazla seçilebilir)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SIDE_OPTIONS.map(opt => {
                    const isSelected = (formData.dvtSide || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleCheckboxToggle('dvtSide', opt)}
                        className={`px-3 py-2 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span>{opt}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'border-white bg-purple-500' : 'border-slate-300 bg-white'}`}>
                          {isSelected && <span className="text-[10px] text-white font-bold">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* 2. LABORATUVAR PARAMETRELERİ */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-xs">
                2. Laboratuvar Parametreleri (19 Parametre)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {LAB_FIELDS.map(lab => (
                <div key={lab.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {lab.label}
                  </label>
                  <input
                    type="text"
                    value={formData[lab.id] || ''}
                    onChange={(e) => handleLabChange(lab.id, e.target.value)}
                    placeholder={lab.placeholder}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:border-indigo-600 focus:bg-white outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Firestore\'a Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
