import React, { useState } from 'react';
import { X, Save, CheckCircle } from 'lucide-react';
import { PatientRecord, updatePatientInFirestore } from '../firebase';
import { QuestionDefinition } from '../types';

interface PatientEditModalProps {
  patient: PatientRecord | null;
  questions: QuestionDefinition[];
  onClose: () => void;
  onSaved: () => void;
}

export const PatientEditModal: React.FC<PatientEditModalProps> = ({
  patient,
  questions,
  onClose,
  onSaved
}) => {
  if (!patient) return null;

  const [editData, setEditData] = useState<Record<string, any>>({ ...patient });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (key: string, val: any) => {
    setEditData(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient.id) return;

    setIsSaving(true);
    try {
      await updatePatientInFirestore(patient.id, editData);
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
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white shrink-0 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Hasta Kaydını Düzenle</h3>
            <p className="text-xs text-slate-300">
              Protokol No: <span className="text-purple-300 font-bold">{patient.protocolNo || patient.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Kayıt Firestore'da başarıyla güncellendi!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hasta Protokol / ID</label>
              <input
                type="text"
                value={editData.protocolNo || ''}
                onChange={(e) => handleChange('protocolNo', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Yaş</label>
              <input
                type="number"
                value={editData.age || ''}
                onChange={(e) => handleChange('age', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cinsiyet</label>
              <select
                value={editData.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-600 outline-none"
              >
                <option value="Kadın">Kadın</option>
                <option value="Erkek">Erkek</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vücut Ağırlığı (kg)</label>
              <input
                type="number"
                value={editData.weightKg || ''}
                onChange={(e) => handleChange('weightKg', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Apixaban Dozu</label>
              <select
                value={editData.apixabanDose || ''}
                onChange={(e) => handleChange('apixabanDose', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-600 outline-none"
              >
                <option value="Günde 2 kez 2.5 mg">Günde 2 kez 2.5 mg</option>
                <option value="Günde 2 kez 5 mg">Günde 2 kez 5 mg</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Son Doz Saati</label>
              <input
                type="text"
                value={editData.lastDoseTime || ''}
                onChange={(e) => handleChange('lastDoseTime', e.target.value)}
                placeholder="Örn: 08:30"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CrCl (mL/dk)</label>
              <input
                type="text"
                value={editData.crCl || ''}
                onChange={(e) => handleChange('crCl', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Serum Kreatinin (mg/dL)</label>
              <input
                type="text"
                value={editData.serumCreatinine || ''}
                onChange={(e) => handleChange('serumCreatinine', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ciltte Morarma (Ekimoz)</label>
              <select
                value={editData.skinBruising || 'Hayır'}
                onChange={(e) => handleChange('skinBruising', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-600 outline-none"
              >
                <option value="Hayır">Hayır</option>
                <option value="Evet (Küçük <2 cm)">Evet (Küçük &lt;2 cm)</option>
                <option value="Evet (Geniş >5 cm)">Evet (Geniş &gt;5 cm)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Melena (Siyah Dışkı)</label>
              <select
                value={editData.melena || 'Hayır'}
                onChange={(e) => handleChange('melena', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-600 outline-none"
              >
                <option value="Hayır">Hayır</option>
                <option value="Evet">Evet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sağlık Kuruluşu / Acil Başvurusu</label>
              <select
                value={editData.hospitalVisit || 'Hayır'}
                onChange={(e) => handleChange('hospitalVisit', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-600 outline-none"
              >
                <option value="Hayır">Hayır</option>
                <option value="Evet (Poliklinik başvurusu)">Evet (Poliklinik)</option>
                <option value="Evet (Acil Servis başvurusu)">Evet (Acil Servis)</option>
                <option value="Evet (Hastaneye yatış yapıldı)">Evet (Hastaneye yatış)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kan Transfüzyonu</label>
              <select
                value={editData.transfusionReceived || 'Hayır'}
                onChange={(e) => handleChange('transfusionReceived', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-600 outline-none"
              >
                <option value="Hayır">Hayır</option>
                <option value="Evet (1 Ünite)">Evet (1 Ünite)</option>
                <option value="Evet (2 Ünite)">Evet (2 Ünite)</option>
                <option value="Evet (≥3 Ünite)">Evet (≥3 Ünite)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
