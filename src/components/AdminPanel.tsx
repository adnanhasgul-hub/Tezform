import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Search,
  Filter,
  PlusCircle,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertOctagon,
  ArrowUpDown,
  Activity,
  HeartPulse,
  Database,
  HelpCircle,
  X,
  Layers,
  ChevronRight,
  Hospital,
  Microscope
} from 'lucide-react';
import { PatientRecord, deletePatientFromFirestore } from '../firebase';
import { QuestionDefinition, QuestionType, ClinicalSectionKey } from '../types';
import { CLINICAL_SECTIONS } from '../defaultQuestions';
import { exportToExcel, exportToWord, exportToPdf, exportToSpss, exportBlankFormPdf } from '../utils/exportUtils';
import { PatientDetailModal } from './PatientDetailModal';
import { PatientEditModal } from './PatientEditModal';
import { PatientCompleteModal } from './PatientCompleteModal';

interface AdminPanelProps {
  patients: PatientRecord[];
  questions: QuestionDefinition[];
  onRefreshData: () => void;
  onAddCustomQuestion: (newQ: Partial<QuestionDefinition>) => void;
  onDeleteQuestion: (qId: string) => void;
  onToggleQuestionActive: (qId: string) => void;
  onGoToForm: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  patients,
  questions,
  onRefreshData,
  onAddCustomQuestion,
  onDeleteQuestion,
  onToggleQuestionActive,
  onGoToForm
}) => {
  // Tabs: 'records' | 'questions'
  const [activeTab, setActiveTab] = useState<'records' | 'questions'>('records');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [bleedingFilter, setBleedingFilter] = useState<'all' | 'bleeding' | 'major' | 'non_bleeding'>('all');
  const [sortField, setSortField] = useState<'createdAt' | 'protocolNo' | 'age'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [selectedPatientDetail, setSelectedPatientDetail] = useState<PatientRecord | null>(null);
  const [selectedPatientEdit, setSelectedPatientEdit] = useState<PatientRecord | null>(null);
  const [selectedPatientComplete, setSelectedPatientComplete] = useState<PatientRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Question Form state
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQTitle, setNewQTitle] = useState('');
  const [newQSection, setNewQSection] = useState<ClinicalSectionKey>('demographics');
  const [newQType, setNewQType] = useState<QuestionType>('radio');
  const [newQOptions, setNewQOptions] = useState('');
  const [newQRequired, setNewQRequired] = useState(false);
  const [newQSpssVar, setNewQSpssVar] = useState('');

  // Handle patient deletion
  const handleDeletePatient = async (id: string) => {
    setIsDeleting(true);
    try {
      await deletePatientFromFirestore(id);
      setIsDeleting(false);
      setDeleteConfirmId(null);
      onRefreshData();
    } catch (err) {
      setIsDeleting(false);
      alert('Silme işlemi başarısız: ' + String(err));
    }
  };

  // Handle adding custom dynamic question
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQTitle.trim()) return;

    const opts = ['radio', 'checkbox', 'select'].includes(newQType)
      ? newQOptions.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const newQuestion: Partial<QuestionDefinition> = {
      title: newQTitle.trim(),
      section: newQSection,
      type: newQType,
      options: opts && opts.length > 0 ? opts : ['Evet', 'Hayır'],
      required: newQRequired,
      spssVarName: newQSpssVar.trim().toUpperCase() || `CUSTOM_${Date.now().toString().slice(-4)}`,
      isCustom: true,
      active: true,
    };

    onAddCustomQuestion(newQuestion);
    setShowAddQuestionModal(false);
    setNewQTitle('');
    setNewQOptions('');
    setNewQSpssVar('');
    setNewQRequired(false);
  };

  const hasBleeding = (p: PatientRecord) =>
    p.skinBruising?.includes('Evet') ||
    p.gingivalBleeding?.includes('Evet') ||
    p.epistaxis?.includes('Evet') ||
    p.cutsProlongedBleeding?.includes('Evet') ||
    p.melena?.includes('Evet') ||
    p.hematochezia?.includes('Evet') ||
    p.hematemesis?.includes('Evet') ||
    p.hematuria?.includes('Evet') ||
    p.severeHeadache?.includes('Evet') ||
    p.hemarthrosis?.includes('Evet') ||
    p.hospitalVisit?.includes('Evet');

  const isMajor = (p: PatientRecord) =>
    p.hospitalVisit?.includes('Hastaneye yatış') ||
    p.transfusionReceived?.includes('Evet') ||
    p.melena?.includes('Evet') ||
    p.severeHeadache?.includes('Evet') ||
    p.hbDrop?.includes('Evet');

  const LAB_FIELD_KEYS = [
    'bun', 'creatinine', 'egfr', 'calcium', 'sodium', 'potassium',
    'totalBilirubin', 'directBilirubin', 'ast', 'alt', 'totalProtein',
    'albumin', 'wbc', 'hgb', 'plt', 'hct', 'pt', 'ptInr', 'aptt'
  ];

  const getPatientCompleteStatus = (p: PatientRecord): 'complete' | 'partial' | 'none' => {
    const dvtLevel = Array.isArray(p.dvtLevel) ? p.dvtLevel : [];
    const dvtSide = Array.isArray(p.dvtSide) ? p.dvtSide : [];
    
    const filledLabsCount = LAB_FIELD_KEYS.filter(key => {
      const val = p[key];
      return val !== undefined && val !== null && String(val).trim() !== '';
    }).length;

    const filledCount = filledLabsCount + (dvtLevel.length > 0 ? 1 : 0) + (dvtSide.length > 0 ? 1 : 0);

    if (filledLabsCount === LAB_FIELD_KEYS.length && dvtLevel.length > 0 && dvtSide.length > 0) {
      return 'complete';
    }
    if (filledCount > 0) {
      return 'partial';
    }
    return 'none';
  };

  // Filtered and sorted patients list
  const filteredPatients = patients
    .filter(p => {
      // Search
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !search ||
        (p.protocolNo && p.protocolNo.toLowerCase().includes(search)) ||
        (p.indication && p.indication.toLowerCase().includes(search)) ||
        (p.apixabanDose && p.apixabanDose.toLowerCase().includes(search)) ||
        (p.lastDoseTime && p.lastDoseTime.toLowerCase().includes(search));

      // Bleeding filter
      if (!matchSearch) return false;
      if (bleedingFilter === 'bleeding') {
        return hasBleeding(p);
      }
      if (bleedingFilter === 'major') {
        return isMajor(p);
      }
      if (bleedingFilter === 'non_bleeding') {
        return !hasBleeding(p);
      }
      return true;
    })
    .sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortField === 'age') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Analytics & Summary Metrics
  const totalCount = patients.length;
  const bleedingCount = patients.filter(hasBleeding).length;
  const majorBleedingCount = patients.filter(isMajor).length;
  const hospitalVisitCount = patients.filter(p => p.hospitalVisit?.includes('Evet')).length;
  const avgAge = totalCount > 0
    ? (patients.reduce((acc, p) => acc + (Number(p.age) || 0), 0) / totalCount).toFixed(1)
    : '0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Export Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
              Yönetici Paneli
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Kullanıcı: <b>adnan</b>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Klinik Araştırma Veri & Anket Yönetimi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cloud Firestore veritabanındaki kayıtları filtreleyin, düzenleyin ve araştırma formatlarında indirin.
          </p>
        </div>

        {/* REFRESH & GO TO FORM */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefreshData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-xs"
            title="Verileri Yenile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onGoToForm}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Hasta Ekle</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Toplam Kayıt</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Firestore 'patients'</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Kanama Olayı</span>
            <HeartPulse className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {bleedingCount} <span className="text-xs text-slate-400 font-normal">({totalCount ? ((bleedingCount / totalCount) * 100).toFixed(0) : 0}%)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Bildirilen kanamalar</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Majör Kanama (ISTH)</span>
            <AlertOctagon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{majorBleedingCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Transfüzyon / Kritik</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Ortalama Yaş</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{avgAge} <span className="text-xs text-slate-400 font-normal">yıl</span></div>
          <div className="text-[11px] text-slate-500 mt-1">Popülasyon ortalaması</div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Sağlık Başvurusu</span>
            <Hospital className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{hospitalVisitCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Acil / Poliklinik / Yatış</div>
        </div>

      </div>

      {/* EXPORT BUTTONS BAR (Core requirement: Excel, Word, PDF, SPSS) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Araştırma Veri Dışa Aktarımı (Export)</h3>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Tüm kayıtlı hasta ve anket verilerini tek tıkla Excel, Word, PDF veya SPSS syntax formatında indirin.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 w-full md:w-auto">
          {/* Button 1: Excel */}
          <button
            onClick={() => exportToExcel(patients, questions)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel'e Aktar (XLSX)</span>
          </button>

          {/* Button 2: Word */}
          <button
            onClick={() => exportToWord(patients)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Word Raporu (.doc)</span>
          </button>

          {/* Button 3: PDF */}
          <button
            onClick={() => exportToPdf(patients)}
            className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-file-pdf text-sm"></i>
            <span>PDF Raporu (.pdf)</span>
          </button>

          {/* Button 4: SPSS */}
          <button
            onClick={() => exportToSpss(patients)}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            title="SPSS .dat veri matrisi ve .sps değişken sözlük syntax dosyasını indirir"
          >
            <i className="fa-solid fa-chart-pie text-sm"></i>
            <span>SPSS Uyumlu Veri</span>
          </button>

          {/* Button 5: Boş Form PDF */}
          <button
            onClick={exportBlankFormPdf}
            className="col-span-2 sm:col-span-1 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-purple-400/40"
            title="Manuel elle doldurmak için boş klinik anket formunu PDF olarak indirir"
          >
            <i className="fa-solid fa-print text-sm"></i>
            <span>Boş Form (PDF)</span>
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION: Hasta Kayıtları vs Soru Yönetimi */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('records')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'records'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hasta Kayıtları Tablosu ({patients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'questions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Soru Ekleme & Yönetimi ({questions.length})</span>
        </button>
      </div>

      {/* TAB 1: PATIENTS TABLE */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Protokol No, endikasyon, doz veya genetik ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Filtrele:</span>
              <button
                onClick={() => setBleedingFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  bleedingFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setBleedingFilter('bleeding')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  bleedingFilter === 'bleeding'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Kanamalı ({bleedingCount})
              </button>
              <button
                onClick={() => setBleedingFilter('major')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  bleedingFilter === 'major'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Majör ({majorBleedingCount})
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Protokol / ID</th>
                  <th className="py-3 px-4">Yaş / Cins</th>
                  <th className="py-3 px-4">Endikasyon</th>
                  <th className="py-3 px-4">Doz</th>
                  <th className="py-3 px-4">Son Doz Saati</th>
                  <th className="py-3 px-4">Kanama Bildirimi</th>
                  <th className="py-3 px-4">Sağlık Başvurusu</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold">Kayıtlı hasta verisi bulunamadı.</p>
                      <p className="text-xs mt-1">Yeni bir veri eklemek için 'Yeni Hasta Ekle' butonunu kullanabilirsiniz.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const patientBleeding = hasBleeding(patient);
                    const patientMajor = isMajor(patient);

                    return (
                      <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {patient.protocolNo || 'İsimsiz'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {patient.age || '-'} y / {patient.gender === 'Erkek' ? 'E' : patient.gender === 'Kadın' ? 'K' : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[150px] truncate" title={patient.indication}>
                          {patient.indication || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {patient.apixabanDose || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          {patient.lastDoseTime || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            patientBleeding
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {patientBleeding ? 'Kanama Var' : 'Kanama Yok'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-xs font-semibold ${
                            patientMajor ? 'text-rose-600 font-bold' : 'text-slate-600'
                          }`}>
                            {patient.hospitalVisit || 'Yok'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Formu Tamamla / Detay Ekle */}
                            {(() => {
                              const status = getPatientCompleteStatus(patient);
                              const btnColorClass = 
                                status === 'complete' 
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' 
                                  : status === 'partial' 
                                  ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' 
                                  : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200';
                              const iconColorClass = 
                                status === 'complete' 
                                  ? 'text-emerald-700' 
                                  : status === 'partial' 
                                  ? 'text-amber-700' 
                                  : 'text-rose-700';

                              return (
                                <button
                                  onClick={() => setSelectedPatientComplete(patient)}
                                  className={`px-2.5 py-1 text-xs font-bold border rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs ${btnColorClass}`}
                                  title={
                                    status === 'complete' 
                                      ? 'Tüm Radyoloji ve Laboratuvar verileri eksiksiz girilmiş (Tam)' 
                                      : status === 'partial' 
                                      ? 'Kısmi veri girişi yapılmış' 
                                      : 'Henüz veri girişi yapılmamış'
                                  }
                                >
                                  <Microscope className={`w-3.5 h-3.5 ${iconColorClass}`} />
                                  <span className="hidden xl:inline">
                                    {status === 'complete' ? 'Tamamlandı' : status === 'partial' ? 'Kısmi Giriş' : 'Formu Tamamla'}
                                  </span>
                                </button>
                              );
                            })()}

                            {/* View Detail */}
                            <button
                              onClick={() => setSelectedPatientDetail(patient)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Detaylı İncele"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => setSelectedPatientEdit(patient)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Kaydı Düzenle"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteConfirmId(patient.id || null)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Kaydı Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Toplam {filteredPatients.length} kayıt listelendi</span>
            <span className="font-mono">Bulut Depolama: Cloud Firestore (ailebutce-2a7cf)</span>
          </div>

        </div>
      )}

      {/* TAB 2: QUESTION MANAGEMENT (SORU EKLEME-ÇIKARMA) */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Anket Soruları Yönetimi</h3>
              <p className="text-xs text-slate-500 mt-1">
                Klinik formdaki soruları yönetin, yeni araştırma soruları ekleyin veya soruları pasif/aktif hale getirin.
              </p>
            </div>

            <button
              onClick={() => setShowAddQuestionModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yeni Soru Ekle</span>
            </button>
          </div>

          {/* Questions List grouped by section */}
          <div className="space-y-4">
            {CLINICAL_SECTIONS.map((sec) => {
              const secQuestions = questions.filter(q => q.section === sec.key);

              return (
                <div key={sec.key} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      {sec.title}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {secQuestions.length} Soru
                    </span>
                  </div>

                  <div className="p-4 divide-y divide-slate-100">
                    {secQuestions.map((q) => (
                      <div key={q.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {q.title}
                            </span>
                            {q.required && (
                              <span className="text-rose-500 text-xs font-bold">*</span>
                            )}
                            {q.isCustom && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">
                                Özel Eklenen
                              </span>
                            )}
                            {q.active === false && (
                              <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[10px] font-bold">
                                Pasif
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Tip: <code className="bg-slate-100 px-1 py-0.2 rounded font-mono text-indigo-700">{q.type}</code> | SPSS Değişkeni: <code className="bg-slate-100 px-1 py-0.2 rounded font-mono text-slate-700">{q.spssVarName || q.id}</code>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Toggle Active */}
                          <button
                            onClick={() => onToggleQuestionActive(q.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              q.active !== false
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {q.active !== false ? 'Aktif' : 'Pasif'}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`"${q.title}" sorusunu anketten silmek istediğinize emin misiniz?`)) {
                                onDeleteQuestion(q.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Soruyu Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* MODAL: ADD DYNAMIC QUESTION */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Yeni Anket Sorusu Ekle</h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Soru Başlığı / Metni *
                </label>
                <input
                  type="text"
                  required
                  value={newQTitle}
                  onChange={(e) => setNewQTitle(e.target.value)}
                  placeholder="Örn: Hastanın sigara kullanım öyküsü var mı?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bölüm Seçimi
                  </label>
                  <select
                    value={newQSection}
                    onChange={(e) => setNewQSection(e.target.value as ClinicalSectionKey)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-600 outline-none"
                  >
                    {CLINICAL_SECTIONS.map(s => (
                      <option key={s.key} value={s.key}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Soru Tipi
                  </label>
                  <select
                    value={newQType}
                    onChange={(e) => setNewQType(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-600 outline-none"
                  >
                    <option value="radio">Tek Seçim (Radio)</option>
                    <option value="checkbox">Çoklu Seçim (Checkbox)</option>
                    <option value="select">Açılır Liste (Select)</option>
                    <option value="text">Kısa Metin (Input)</option>
                    <option value="number">Sayısal Değer (Number)</option>
                    <option value="textarea">Uzun Metin (Textarea)</option>
                  </select>
                </div>
              </div>

              {['radio', 'checkbox', 'select'].includes(newQType) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seçenekler (Virgülle Ayırarak Yazın)
                  </label>
                  <input
                    type="text"
                    value={newQOptions}
                    onChange={(e) => setNewQOptions(e.target.value)}
                    placeholder="Evet, Hayır, Bilinmiyor"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-600 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SPSS Değişken Adı (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={newQSpssVar}
                  onChange={(e) => setNewQSpssVar(e.target.value)}
                  placeholder="Örn: SMOKING_STATUS"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-indigo-600 outline-none uppercase"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="req_checkbox"
                  checked={newQRequired}
                  onChange={(e) => setNewQRequired(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="req_checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Bu soruyu doldurmak zorunlu olsun
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer"
                >
                  Soruyu Kaydet
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Kaydı Silmek İstiyor Musunuz?</h4>
            <p className="text-xs text-slate-500 mt-1">
              Bu hasta verisi Firestore veritabanından kalıcı olarak silinecektir. Bu işlem geri alınamaz.
            </p>

            <div className="mt-5 flex gap-2.5">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Vazgeç
              </button>
              <button
                disabled={isDeleting}
                onClick={() => handleDeletePatient(deleteConfirmId)}
                className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
              >
                {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedPatientDetail && (
        <PatientDetailModal
          patient={selectedPatientDetail}
          questions={questions}
          onClose={() => setSelectedPatientDetail(null)}
          onEdit={(p) => {
            setSelectedPatientDetail(null);
            setSelectedPatientEdit(p);
          }}
        />
      )}

      {/* EDIT MODAL */}
      {selectedPatientEdit && (
        <PatientEditModal
          patient={selectedPatientEdit}
          questions={questions}
          onClose={() => setSelectedPatientEdit(null)}
          onSaved={() => {
            onRefreshData();
          }}
        />
      )}

      {/* COMPLETE / RADIOLOGY & LAB MODAL */}
      {selectedPatientComplete && (
        <PatientCompleteModal
          patient={selectedPatientComplete}
          onClose={() => setSelectedPatientComplete(null)}
          onSaved={() => {
            onRefreshData();
          }}
        />
      )}

    </div>
  );
};
