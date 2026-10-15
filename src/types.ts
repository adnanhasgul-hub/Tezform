export type QuestionType = 'radio' | 'checkbox' | 'select' | 'text' | 'number' | 'textarea';

export type ClinicalSectionKey = 
  | 'demographics'
  | 'usage_compliance'
  | 'concomitant_drugs'
  | 'bleeding_symptoms'
  | 'clinical_outcomes'
  | 'temporal_causality';

export interface QuestionDefinition {
  id: string;
  section: ClinicalSectionKey;
  title: string;
  description?: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  spssVarName?: string;
  isCustom?: boolean;
  active?: boolean;
  placeholder?: string;
}

export interface SectionMeta {
  key: ClinicalSectionKey;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
}

export interface PatientFormData {
  // Section 1: Demographics
  protocolNo: string;
  age: string;
  gender: string;
  weightKg: string;
  heightCm: string;
  indication: string;
  renalFunction: string;
  liverFunction: string;
  comorbidities: string[];
  geneticVariants: string;

  // Section 2: Apixaban Usage & Compliance
  apixabanDose: string;
  treatmentDurationMonths: string;
  complianceLevel: string;
  doseReductionCriteriaMet: string;
  foodIntakeStatus: string;

  // Section 3: Concomitant Medications
  strongCyp3a4PgpInhibitors: string;
  strongCyp3a4PgpInducers: string;
  antiplateletUse: string[];
  nsaidUse: string;
  antidepressantUse: string;
  otherMedicationsText: string;

  // Section 4: Bleeding Symptoms (ISTH Criteria)
  bleedingOccurred: string; // 'Evet' | 'Hayır'
  epistaxis: string; // Burun kanaması
  gingivalBleeding: string; // Diş eti kanaması
  skinHematoma: string; // Cilt / hematom
  giBleeding: string; // GİS kanaması
  urinaryBleeding: string; // Hematüri
  ocularBleeding: string; // Göz kanaması
  intracranialBleeding: string; // SSS / Beyin kanaması
  jointMuscleBleeding: string; // Hemartroz / Kas
  bleedingSeverityCategory: string; // Minör / CRNMB / Majör

  // Section 5: Clinical Outcomes & Interventions
  hospitalEmergencyVisit: string;
  bloodTransfusionUnits: string;
  apixabanActionTaken: string;
  antidoteAdministered: string;
  hemoglobinDrop: string;
  clinicalOutcome: string;

  // Section 6: Temporal Relationship & Causality
  timeToBleedingOnset: string;
  dechallengeResult: string;
  rechallengeResult: string;
  naranjoCausalityScore: string;
  physicianNotes: string;

  // Dynamic / Custom Question answers
  [key: string]: any;
}

export interface AdminUser {
  username: string;
  isAuthenticated: boolean;
}
