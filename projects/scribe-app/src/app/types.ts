export type SpeakerType = 'doctor' | 'patient';

export interface TranscriptUtterance {
  id: string;
  speaker: SpeakerType | 'system';
  speakerName: string;
  text: string;
  timestamp: string;
  timeSec: number;
  confidence: number;
  highlightedEntityIds?: string[];
  isFlagged?: boolean;
  isNote?: boolean;
}

export type EntityCategory = 'symptom' | 'diagnosis' | 'medication' | 'allergy' | 'vital';

export interface MedicalEntity {
  id: string;
  category: EntityCategory;
  term: string;
  code: string;
  system: 'ICD-10' | 'RxNorm' | 'SNOMED-CT' | 'LOINC';
  confidence: number;
  timestamp: string;
  status: 'verified' | 'flag' | 'pending';
}

export interface SoapSubjective {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  reviewOfSystems: string;
  currentMedications: string;
  allergies: string;
}

export interface SoapObjective {
  vitals: string;
  physicalExam: string;
  diagnosticResults: string;
}

export interface SoapAssessment {
  primaryDiagnosis: string;
  differentialDiagnoses: string[];
  clinicalImpression: string;
}

export interface SoapPlan {
  diagnostics: string;
  medicationsAndRx: string;
  patientEducation: string;
  followUp: string;
}

export interface SoapNote {
  subjective: SoapSubjective;
  objective: SoapObjective;
  assessment: SoapAssessment;
  plan: SoapPlan;
  lastUpdated?: string;
  isSigned?: boolean;
  signedBy?: string;
  signedAt?: string;
}

export interface PatientContext {
  mrn: string;
  fullName: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  dob: string;
  encounterType: string;
  department: string;
  room: string;
  allergies: string[];
  primaryCareProvider: string;
  insurance: string;
}

export interface ClinicalEncounter {
  id: string;
  title: string;
  specialty: string;
  patient: PatientContext;
  utterances: TranscriptUtterance[];
  entities: MedicalEntity[];
  soap: SoapNote;
}
