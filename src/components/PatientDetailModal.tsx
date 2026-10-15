import React from 'react';
import { X, User, HeartPulse, Pill, Activity, Hospital, Clock, AlertTriangle, Printer, Download } from 'lucide-react';
import { PatientRecord } from '../firebase';
import { QuestionDefinition } from '../types';
import { exportFilledPatientPdf } from '../utils/exportUtils';

interface PatientDetailModalProps {
  patient: PatientRecord | null;
  questions: QuestionDefinition[];
  onClose: () => void;
  onEdit: (patient: PatientRecord) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  questions,
  onClose,
  onEdit
}) => {
  if (!patient) return null;

  const hasBleeding =
    patient.skinBruising?.includes('Evet') ||
    patient.gingivalBleeding?.includes('Evet') ||
    patient.epistaxis?.includes('Evet') ||
    patient.melena?.includes('Evet') ||
    patient.hematochezia?.includes('Evet') ||
    patient.hematemesis?.includes('Evet') ||
    patient.hematuria?.includes('Evet') ||
    patient.hemarthrosis?.includes('Evet') ||
    patient.hospitalVisit?.includes('Evet');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 text-white shrink-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-inner ${
              hasBleeding ? 'bg-rose-600' : 'bg-emerald-600'
            }`}>
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  {patient.protocolNo || 'İsimsiz Kayıt'}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  hasBleeding
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                }`}>
                  {hasBleeding ? 'Kanama Bildirimi Var' : 'Kanama Bildirilmedi'}
                </span>
                <span className="text-xs bg-purple-900/60 text-purple-200 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  Mor Tüp Kan Alınacak
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Kayıt Tarihi: {patient.createdAt ? new Date(patient.createdAt).toLocaleString('tr-TR') : 'Belirtilmemiş'} | Kayıt ID: {patient.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportFilledPatientPdf(patient)}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="2 Sayfalık CRF PDF Raporu İndir"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Yazdır (A4)"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-800 divide-y divide-slate-100">
          
          {/* Section 1: Demographics */}
          <div className="pt-2 first:pt-0">
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-3">
              <User className="w-3.5 h-3.5" />
              BÖLÜM 1: Hasta Demografik ve Temel Klinik Bilgileri
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[11px] text-slate-500 block">Protokol / ID</span>
                <span className="font-bold text-slate-900">{patient.protocolNo || '-'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Yaş / Cinsiyet</span>
                <span className="font-semibold text-slate-900">{patient.age || '-'} yaş / {patient.gender || '-'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Kilo / Boy</span>
                <span className="font-semibold text-slate-900">{patient.weightKg || '-'} kg / {patient.heightCm || '-'} cm</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Endikasyon</span>
                <span className="font-semibold text-purple-700">{patient.indication || '-'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Serum Kreatinin</span>
                <span className="font-semibold text-slate-900">{patient.serumCreatinine || '-'} mg/dL</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">CrCl (Kreatinin Klerensi)</span>
                <span className="font-bold text-indigo-700">{patient.crCl || '-'} mL/dk</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">ALT / AST</span>
                <span className="font-semibold text-slate-900">{patient.altAst || '-'} IU/L</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Hemoglobin (Hb)</span>
                <span className="font-semibold text-slate-900">{patient.hbValue || '-'} g/dL</span>
              </div>
            </div>
          </div>

          {/* Section 2: Usage & Compliance */}
          <div className="pt-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-3">
              <Pill className="w-3.5 h-3.5" />
              BÖLÜM 2: Apixaban Kullanım ve Uyum Detayları
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[11px] text-slate-500 block">Günlük Apixaban Dozu</span>
                <span className="font-bold text-indigo-900">{patient.apixabanDose || '-'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Tedavi Başlama / Süre</span>
                <span className="font-semibold text-slate-900">{patient.treatmentStartDate || '-'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">İlaç Uyumu</span>
                <span className="font-semibold text-slate-900">{patient.complianceLevel || '-'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Son Doz Saati</span>
                <span className="font-bold text-purple-700">{patient.lastDoseTime || '-'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Concomitant Medications */}
          <div className="pt-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-3">
              <Activity className="w-3.5 h-3.5" />
              BÖLÜM 3: Eşzamanlı İlaç Kullanımı ve Etkileşimler
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[11px] text-slate-500 block">Diğer Kan Sulandırıcı / Pıhtı Önleyici</span>
                <span className="font-semibold text-slate-900">
                  {Array.isArray(patient.otherAnticoagulant) ? patient.otherAnticoagulant.join(', ') : patient.otherAnticoagulant || 'Yok'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">NSAİİ (Ağrı Kesici) Kullanımı</span>
                <span className="font-semibold text-slate-900">{patient.nsaidUse || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">CYP3A4 / P-gp İnhibitörleri (Konsantrasyonu Artıranlar)</span>
                <span className="font-semibold text-slate-900">
                  {Array.isArray(patient.cyp3a4PgpInhibitors) ? patient.cyp3a4PgpInhibitors.join(', ') : patient.cyp3a4PgpInhibitors || 'Yok'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">CYP3A4 İndükleyicileri (Konsantrasyonu Düşürenler)</span>
                <span className="font-semibold text-slate-900">
                  {Array.isArray(patient.cyp3a4Inducers) ? patient.cyp3a4Inducers.join(', ') : patient.cyp3a4Inducers || 'Yok'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Bleeding Symptoms */}
          <div className="pt-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              BÖLÜM 4: Organ Sistemlerine Göre Kanama Belirtileri
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-rose-50/40 p-4 rounded-xl border border-rose-200/60">
              <div>
                <span className="text-[11px] text-slate-500 block">Ciltte Morarma (Ekimoz)</span>
                <span className="font-semibold text-slate-900">{patient.skinBruising || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Diş Eti Kanaması</span>
                <span className="font-semibold text-slate-900">{patient.gingivalBleeding || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Burun Kanaması (Epistaksis)</span>
                <span className="font-semibold text-slate-900">{patient.epistaxis || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Küçük Kesiklerde Uzun Kanama</span>
                <span className="font-semibold text-slate-900">{patient.cutsProlongedBleeding || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Melena (Siyah Dışkı)</span>
                <span className="font-bold text-rose-700">{patient.melena || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Hematokezya (Taze Kan)</span>
                <span className="font-bold text-rose-700">{patient.hematochezia || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Hematemez (Kanlı Kusma)</span>
                <span className="font-bold text-rose-700">{patient.hematemesis || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Hematüri (İdrarda Kan)</span>
                <span className="font-semibold text-slate-900">{patient.hematuria || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Menoraji (Aşırı Adet)</span>
                <span className="font-semibold text-slate-900">{patient.menorrhagia || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Şiddetli Baş Ağrısı</span>
                <span className="font-bold text-rose-700">{patient.severeHeadache || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Nörolojik Semptom</span>
                <span className="font-bold text-rose-700">{patient.neurologicalSymptoms || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Hemartroz (Eklem Şişliği)</span>
                <span className="font-semibold text-slate-900">{patient.hemarthrosis || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Hemoptizi (Kanlı Balgam)</span>
                <span className="font-semibold text-slate-900">{patient.hemoptysis || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Göz İçi Kanama / Kızarıklık</span>
                <span className="font-semibold text-slate-900">{patient.ocularBleeding || 'Hayır'}</span>
              </div>
            </div>
          </div>

          {/* Section 5: Clinical Outcomes */}
          <div className="pt-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-3">
              <Hospital className="w-3.5 h-3.5" />
              BÖLÜM 5: Kanamanın Şiddeti ve Klinik Sonuçları
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[11px] text-slate-500 block">Sağlık Kuruluşuna Başvuru</span>
                <span className="font-semibold text-slate-900">{patient.hospitalVisit || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Kan Transfüzyonu</span>
                <span className="font-semibold text-slate-900">{patient.transfusionReceived || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Tedaviye Ara Verme</span>
                <span className="font-semibold text-slate-900">{patient.treatmentInterruption || 'Hayır'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Hb Düşüşü (&gt;2 g/dL)</span>
                <span className="font-semibold text-slate-900">{patient.hbDrop || 'Hayır'}</span>
              </div>
            </div>
          </div>

          {/* Section 6: Temporal */}
          <div className="pt-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-3">
              <Clock className="w-3.5 h-3.5" />
              BÖLÜM 6: Zamansal İlişki
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[11px] text-slate-500 block">Kanamaya Kadar Geçen Süre</span>
                <span className="font-semibold text-slate-900">{patient.bleedingOnsetTime || '-'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Kanama Günü İlaç Doz Alımı</span>
                <span className="font-semibold text-slate-900">{patient.doseTimingOnBleedingDay || '-'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onEdit(patient);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Kaydı Düzenle
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
