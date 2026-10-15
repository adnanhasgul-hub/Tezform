/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeHero } from './components/HomeHero';
import { PatientForm } from './components/PatientForm';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { INITIAL_QUESTIONS } from './defaultQuestions';
import { QuestionDefinition, AdminUser } from './types';
import {
  PatientRecord,
  fetchAllPatients,
  fetchCustomQuestions,
  addCustomQuestionToFirestore,
  deleteCustomQuestionFromFirestore
} from './firebase';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'form' | 'admin'>('home');
  const [adminUser, setAdminUser] = useState<AdminUser>({
    username: '',
    isAuthenticated: false,
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Patients and Questions state
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [questions, setQuestions] = useState<QuestionDefinition[]>(INITIAL_QUESTIONS);
  const [isLoading, setIsLoading] = useState(true);

  // Load patients and questions purely from Firestore
  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching patients from Cloud Firestore ("patients")...');
      const patientList = await fetchAllPatients();
      console.log('Fetched patients successfully:', patientList.length, patientList);

      const customQuestions = await fetchCustomQuestions();
      console.log('Fetched custom questions successfully:', customQuestions.length);

      setPatients(patientList);

      // Merge custom questions with default
      if (customQuestions && customQuestions.length > 0) {
        setQuestions([...INITIAL_QUESTIONS, ...customQuestions]);
      } else {
        setQuestions(INITIAL_QUESTIONS);
      }
    } catch (e) {
      console.error('Firestore load error (Missing or insufficient permissions / network):', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Admin Access Click from Home or Header
  const handleOpenAdminSection = () => {
    if (adminUser.isAuthenticated) {
      setCurrentView('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    setAdminUser({ username: '', isAuthenticated: false });
    setCurrentView('home');
  };

  // Dynamic Question Handlers
  const handleAddCustomQuestion = async (newQ: Partial<QuestionDefinition>) => {
    try {
      const qId = await addCustomQuestionToFirestore(newQ);
      const fullQ: QuestionDefinition = {
        id: qId,
        section: newQ.section || 'demographics',
        title: newQ.title || '',
        type: newQ.type || 'text',
        options: newQ.options,
        required: !!newQ.required,
        spssVarName: newQ.spssVarName,
        isCustom: true,
        active: true
      };
      setQuestions(prev => [...prev, fullQ]);
    } catch (err) {
      console.error('Failed to add custom question:', err);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    try {
      await deleteCustomQuestionFromFirestore(qId);
      setQuestions(prev => prev.filter(q => q.id !== qId));
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const handleToggleQuestionActive = (qId: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === qId) {
          return { ...q, active: q.active === false ? true : false };
        }
        return q;
      })
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* Top Application Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAdminLogin={() => setIsLoginModalOpen(true)}
        adminUser={adminUser}
        onLogoutAdmin={handleAdminLogout}
        totalRecordsCount={patients.length}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeHero
            onGoToForm={() => setCurrentView('form')}
            onGoToAdmin={handleOpenAdminSection}
            totalPatientsCount={patients.length}
          />
        )}

        {currentView === 'form' && (
          <PatientForm
            questions={questions.filter(q => q.active !== false)}
            onBackToHome={() => setCurrentView('home')}
            onGoToAdmin={handleOpenAdminSection}
            onPatientSaved={loadData}
          />
        )}

        {currentView === 'admin' && (
          adminUser.isAuthenticated ? (
            <AdminPanel
              patients={patients}
              questions={questions}
              onRefreshData={loadData}
              onAddCustomQuestion={handleAddCustomQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onToggleQuestionActive={handleToggleQuestionActive}
              onGoToForm={() => setCurrentView('form')}
            />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-lock text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Yönetim Girişi Gerekli</h3>
              <p className="text-xs text-slate-500 mt-2 mb-6">
                Yönetim paneline erişmek için lütfen yetkili kullanıcı adı ve şifrenizi giriniz.
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-colors"
              >
                Giriş Yap
              </button>
            </div>
          )
        )}
      </main>

      {/* Global Footer (Hidden in form view for true single screen experience) */}
      {currentView !== 'form' && (
        <footer className="bg-white border-t border-slate-200 py-6 mt-12 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Adnan Tez Formu</span>
              <span>•</span>
              <span>Cloud Firestore Entegre (erukvcaistudio)</span>
            </div>
            <div>
              Tıbbi ve bilimsel araştırma amaçlı veri toplama ve ISTH kanama analiz arayüzü.
            </div>
          </div>
        </footer>
      )}

      {/* Admin Login Modal (User: adnan / Pass: 121325) */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessLogin={handleAdminLoginSuccess}
      />

    </div>
  );
}
