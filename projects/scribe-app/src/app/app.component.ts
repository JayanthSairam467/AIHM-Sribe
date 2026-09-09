import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom, timeout } from 'rxjs';
import { SessionsService, TasksService, MessagesService, RecordsService } from 'api-client';
import { FormsModule } from '@angular/forms';
import { CLINICAL_ENCOUNTERS } from './data/mock-encounters';
import { ClinicalEncounter, SoapNote, MedicalEntity, TranscriptUtterance } from './types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ayzilsmrademvwdpqqhd.supabase.co', 'sb_publishable_VOM5JzguqWPVHxoYcNXOJQ_uy7IZi1s');
import {
  HeaderBarComponent,
  PatientContextRibbonComponent,
  AudioCaptureBarComponent,
  TranscriptionPanelComponent,
  EntityExtractionRailComponent,
  SoapEditorComponent,
  SignoffModalComponent,
  RefineSectionModalComponent,
} from 'ui-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderBarComponent,
    PatientContextRibbonComponent,
    AudioCaptureBarComponent,
    TranscriptionPanelComponent,
    EntityExtractionRailComponent,
    SoapEditorComponent,
    SignoffModalComponent,
    RefineSectionModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  async loadPharmacistData() {
    const fetch = async () => {
      const { data, error } = await supabase.from('soap_notes').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        this.pharmacistPrescriptions = data.filter(note => note.plan && Object.keys(note.plan).length > 0);
      }
    };
    await fetch();
    this.pollInterval = setInterval(fetch, 3000);
  }

  pharmacistPrescriptions: any[] = [];
  pollInterval: any;

  // API Controllers
  private sessionsService = inject(SessionsService);
  private tasksService = inject(TasksService);
  private messagesService = inject(MessagesService);
  private recordsService = inject(RecordsService);

  // Toast Notification State
  toastMessage: string | null = null;
  toastType: 'error' | 'success' | 'info' = 'info';

  showToast(message: string, type: 'error' | 'success' | 'info' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  encounters = CLINICAL_ENCOUNTERS;
  currentEncounterId = CLINICAL_ENCOUNTERS[0].id;

  get activeEncounter(): ClinicalEncounter {
    return this.encounters.find(e => e.id === this.currentEncounterId) || this.encounters[0];
  }

  soapNote: SoapNote = { ...CLINICAL_ENCOUNTERS[0].soap };
  entities: MedicalEntity[] = [...CLINICAL_ENCOUNTERS[0].entities];
  selectedEntityId: string | null = null;

  captureMode: 'simulation' | 'microphone' | 'upload' = 'simulation';
  isRecording = false;
  isSimulating = false;
  timerSeconds = 142;
  visibleUtteranceCount = CLINICAL_ENCOUNTERS[0].utterances.length;
  isGenerating = false;

  leftRailTab: 'transcript' | 'entities' = 'transcript';

  isSignoffModalOpen = false;
  privacyMode = false;
  isFhirModalOpen = false;
  refineModalState = { isOpen: false, sectionKey: '', sectionTitle: '', currentText: '' };

  // Authentication State
  isLoggedIn = false;
  loginEmail = 'dr.sarah@scribe.ai';
  loginPassword = 'password123';
  loginError = false;
  loginRole = 'Doctor';

  fillCredentials(email: string, pass: string = 'password123') {
    this.loginEmail = email;
    this.loginPassword = pass;
  }

  getMedicationArray(plan: any): any[] {
    if (!plan) return [];
    const meds = plan.medications || plan.medicationsAndRx;
    if (Array.isArray(meds)) return meds;
    if (typeof meds === 'string') return [{ name: meds }];
    return [];
  }

  parseMedications(plan: any): string {
    if (!plan) return 'No medications prescribed.';
    if (plan.medicationsAndRx) return typeof plan.medicationsAndRx === 'string' ? plan.medicationsAndRx : JSON.stringify(plan.medicationsAndRx, null, 2);
    if (plan.medications) return typeof plan.medications === 'string' ? plan.medications : JSON.stringify(plan.medications, null, 2);
    return JSON.stringify(plan, null, 2);
  }

  dispensingNoteId: string | null = null;
  dispenseStep: number = 0;
  mockActionMessage: string | null = null;

  // Pharmacist sub-page state
  pharmacistView: 'queue' | 'inventory' | 'patients' = 'queue';

  // Modal state for chart and summary views
  viewingChartNote: any = null;
  viewingSummaryNote: any = null;

  // Mock Inventory Data
  inventoryData = [
    { drug: 'Atorvastatin 20mg', ndc: '0378-3950-77', stock: 5, reorder: 50, expiry: '2027-01-30', status: 'Critical' },
    { drug: 'Levothyroxine 50mcg', ndc: '0074-4552-19', stock: 850, reorder: 200, expiry: '2028-05-12', status: 'In Stock' },
    { drug: 'Lisinopril 10mg', ndc: '0093-1042-01', stock: 320, reorder: 75, expiry: '2027-06-20', status: 'In Stock' },
    { drug: 'Metformin 500mg', ndc: '0093-7212-01', stock: 600, reorder: 150, expiry: '2027-09-01', status: 'In Stock' },
    { drug: 'Amlodipine 5mg', ndc: '0093-3162-56', stock: 42, reorder: 60, expiry: '2026-10-25', status: 'Low' },
    { drug: 'Metoprolol Tartrate 25mg', ndc: '0378-0220-01', stock: 450, reorder: 100, expiry: '2027-03-15', status: 'In Stock' },
    { drug: 'Albuterol Inhaler 90mcg', ndc: '0068-0206-61', stock: 120, reorder: 40, expiry: '2026-11-20', status: 'In Stock' },
    { drug: 'Omeprazole 20mg', ndc: '0378-5220-05', stock: 210, reorder: 80, expiry: '2027-04-18', status: 'In Stock' },
    { drug: 'Losartan 50mg', ndc: '0093-7366-98', stock: 300, reorder: 100, expiry: '2028-01-10', status: 'In Stock' },
    { drug: 'Gabapentin 300mg', ndc: '0093-0039-05', stock: 540, reorder: 200, expiry: '2027-07-22', status: 'In Stock' },
    { drug: 'Hydrochlorothiazide 25mg', ndc: '0591-5532-01', stock: 175, reorder: 50, expiry: '2027-08-12', status: 'In Stock' },
    { drug: 'Sertraline 50mg', ndc: '0069-4210-68', stock: 280, reorder: 100, expiry: '2027-11-30', status: 'In Stock' },
    { drug: 'Simvastatin 20mg', ndc: '0093-7154-98', stock: 15, reorder: 50, expiry: '2026-09-15', status: 'Critical' },
    { drug: 'Montelukast 10mg', ndc: '0093-7402-82', stock: 190, reorder: 60, expiry: '2028-02-28', status: 'In Stock' },
    { drug: 'Escitalopram 10mg', ndc: '0456-2010-01', stock: 310, reorder: 100, expiry: '2027-10-05', status: 'In Stock' },
    { drug: 'Acetaminophen 500mg', ndc: '0045-0444-09', stock: 1200, reorder: 500, expiry: '2029-01-01', status: 'In Stock' },
    { drug: 'Amoxicillin 500mg', ndc: '0093-3109-01', stock: 28, reorder: 100, expiry: '2026-11-10', status: 'Low' },
    { drug: 'Pantoprazole 40mg', ndc: '0008-0841-81', stock: 220, reorder: 80, expiry: '2027-05-15', status: 'In Stock' },
    { drug: 'Clopidogrel 75mg', ndc: '0024-5851-31', stock: 140, reorder: 50, expiry: '2028-03-20', status: 'In Stock' },
    { drug: 'Fluticasone Nasal Spray', ndc: '0173-0453-01', stock: 65, reorder: 30, expiry: '2027-09-10', status: 'In Stock' },
    { drug: 'Trazodone 50mg', ndc: '0093-3221-01', stock: 180, reorder: 60, expiry: '2027-12-01', status: 'In Stock' },
    { drug: 'Duloxetine 30mg', ndc: '0002-3240-30', stock: 240, reorder: 80, expiry: '2028-04-14', status: 'In Stock' },
    { drug: 'Carvedilol 12.5mg', ndc: '0007-4144-13', stock: 110, reorder: 50, expiry: '2027-08-30', status: 'In Stock' },
    { drug: 'Prednisone 10mg', ndc: '0054-4728-25', stock: 0, reorder: 30, expiry: 'N/A', status: 'Out of Stock' },
    { drug: 'Fluoxetine 20mg', ndc: '0077-3105-31', stock: 290, reorder: 100, expiry: '2028-06-18', status: 'In Stock' },
    { drug: 'Nitroglycerin SL 0.4mg', ndc: '0591-0540-01', stock: 82, reorder: 50, expiry: '2026-12-01', status: 'In Stock' },
    { drug: 'Rosuvastatin 10mg', ndc: '0310-0140-90', stock: 350, reorder: 100, expiry: '2028-09-22', status: 'In Stock' },
    { drug: 'Meloxicam 15mg', ndc: '0093-7215-98', stock: 160, reorder: 60, expiry: '2027-02-11', status: 'In Stock' },
    { drug: 'Azithromycin 250mg', ndc: '0069-3060-75', stock: 45, reorder: 50, expiry: '2026-11-05', status: 'Low' },
    { drug: 'Clonazepam 1mg', ndc: '0093-3213-01', stock: 200, reorder: 75, expiry: '2027-03-29', status: 'In Stock' },
    { drug: 'Oxycodone 5mg', ndc: '0406-0552-01', stock: 90, reorder: 50, expiry: '2026-10-15', status: 'In Stock' },
    { drug: 'Ibuprofen 800mg', ndc: '0093-0047-05', stock: 850, reorder: 200, expiry: '2028-11-30', status: 'In Stock' },
    { drug: 'Tamsulosin 0.4mg', ndc: '0591-0130-01', stock: 130, reorder: 50, expiry: '2027-05-10', status: 'In Stock' },
    { drug: 'Cephalexin 500mg', ndc: '0093-3147-01', stock: 35, reorder: 100, expiry: '2026-12-25', status: 'Low' }
  ];

  // Mock Patient Directory Data
  patientDirectory = [
    { name: 'Marcus Reynolds', mrn: '88492', age: 42, gender: 'Male', lastVisit: '2026-09-07', activeRx: 2, weight: '82 kg', bp: '120/80', allergies: 'Penicillin', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Emily Watson', mrn: '77231', age: 34, gender: 'Female', lastVisit: '2026-09-06', activeRx: 1, weight: '65 kg', bp: '115/75', allergies: 'None', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'James Carter', mrn: '91045', age: 58, gender: 'Male', lastVisit: '2026-09-05', activeRx: 3, weight: '95 kg', bp: '135/85', allergies: 'Sulfa Drugs', avatar: 'https://randomuser.me/api/portraits/men/67.jpg' },
    { name: 'Sofia Martinez', mrn: '62879', age: 29, gender: 'Female', lastVisit: '2026-09-04', activeRx: 1, weight: '58 kg', bp: '110/70', allergies: 'Latex', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { name: 'Robert Kim', mrn: '55412', age: 67, gender: 'Male', lastVisit: '2026-09-03', activeRx: 4, weight: '78 kg', bp: '142/88', allergies: 'Aspirin', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
    { name: 'Aisha Patel', mrn: '43890', age: 45, gender: 'Female', lastVisit: '2026-09-02', activeRx: 2, weight: '62 kg', bp: '118/78', allergies: 'Peanuts', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
    { name: 'David Thompson', mrn: '32014', age: 51, gender: 'Male', lastVisit: '2026-09-01', activeRx: 3, weight: '88 kg', bp: '128/82', allergies: 'None', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
    { name: 'Olivia Bennett', mrn: '15893', age: 26, gender: 'Female', lastVisit: '2026-08-29', activeRx: 1, weight: '54 kg', bp: '105/65', allergies: 'Ibuprofen', avatar: 'https://randomuser.me/api/portraits/women/29.jpg' },
    { name: 'William Chen', mrn: '98452', age: 62, gender: 'Male', lastVisit: '2026-08-28', activeRx: 5, weight: '76 kg', bp: '138/86', allergies: 'Dust Mites', avatar: 'https://randomuser.me/api/portraits/men/85.jpg' },
    { name: 'Isabella Rossi', mrn: '44781', age: 39, gender: 'Female', lastVisit: '2026-08-25', activeRx: 2, weight: '68 kg', bp: '118/76', allergies: 'Seafood', avatar: 'https://randomuser.me/api/portraits/women/55.jpg' },
    { name: 'Thomas Wright', mrn: '77329', age: 71, gender: 'Male', lastVisit: '2026-08-20', activeRx: 4, weight: '85 kg', bp: '145/90', allergies: 'None', avatar: 'https://randomuser.me/api/portraits/men/11.jpg' },
    { name: 'Mia Johnson', mrn: '22948', age: 31, gender: 'Female', lastVisit: '2026-08-15', activeRx: 1, weight: '60 kg', bp: '112/72', allergies: 'Amoxicillin', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' }
  ];

  getMockPatientForNote(note: any, index?: number) {
    if (index !== undefined) {
      return this.patientDirectory[index % this.patientDirectory.length];
    }
    if (!note || !note.id) return this.patientDirectory[0];
    let hash = 0;
    for (let i = 0; i < note.id.length; i++) {
      hash = ((hash << 5) - hash) + note.id.charCodeAt(i);
      hash |= 0;
    }
    return this.patientDirectory[Math.abs(hash) % this.patientDirectory.length];
  }

  getAnonymizedPatient(note: any) {
    const p = this.getMockPatientForNote(note);
    return {
      ...p,
      name: `ANON-${p.mrn.substring(0, 3)}**`,
      age: '**',
      gender: 'Undisclosed',
      weight: '*** kg',
      bp: '***/***',
      avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTRhM2I4IiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0iTTE2IDdhNCA0IDAgMTEtOCAwIDQgNCAwIDAxOCAwek0xMiAxNGE3IDcgMCAwMDctN2gtMTRhNyA3IDAgMDA3IDd6Ii8+PC9zdmc+'
    };
  }

  mockAction(action: string) {
    this.mockActionMessage = action;
  }

  startDispense(noteId: string) {
    this.dispensingNoteId = noteId;
    this.dispenseStep = 1;
    setTimeout(() => {
      this.dispenseStep = 2;
      setTimeout(() => {
        this.dispenseStep = 3;
        setTimeout(() => {
          this.pharmacistPrescriptions = this.pharmacistPrescriptions.filter(n => n.id !== noteId);
          this.dispensingNoteId = null;
          this.dispenseStep = 0;
        }, 2000);
      }, 1500);
    }, 1500);
  }

  // --- Plain English helpers for Patient Portal ---
  plainEnglishSubjective(s: any): string {
    if (!s) return 'No information recorded.';
    let parts: string[] = [];
    if (s.chiefComplaint) parts.push(`You visited the doctor because of: ${s.chiefComplaint}.`);
    if (s.historyOfPresentIllness) parts.push(`What you told the doctor: ${s.historyOfPresentIllness}`);
    if (s.reviewOfSystems) parts.push(`Other symptoms reviewed: ${s.reviewOfSystems}`);
    if (s.allergies) parts.push(`Your known allergies: ${s.allergies}`);
    return parts.join('\n\n') || JSON.stringify(s);
  }

  plainEnglishObjective(o: any): string {
    if (!o) return 'No examination findings recorded.';
    let parts: string[] = [];
    if (o.vitalSigns && typeof o.vitalSigns === 'object') {
      const v = o.vitalSigns;
      let vitals = [];
      if (v.bloodPressure) vitals.push(`Blood Pressure: ${v.bloodPressure}`);
      if (v.heartRate) vitals.push(`Heart Rate: ${v.heartRate}`);
      if (v.temperature) vitals.push(`Temperature: ${v.temperature}`);
      if (v.respiratoryRate) vitals.push(`Breathing Rate: ${v.respiratoryRate}`);
      if (v.oxygenSaturation) vitals.push(`Oxygen Level: ${v.oxygenSaturation}`);
      if (vitals.length) parts.push(`Your vital signs:\n${vitals.join('\n')}`);
    }
    if (o.physicalExam) parts.push(`What the doctor found during the exam: ${o.physicalExam}`);
    if (o.labResults) parts.push(`Lab or test results: ${o.labResults}`);
    return parts.join('\n\n') || JSON.stringify(o);
  }

  plainEnglishAssessment(a: any): string {
    if (!a) return 'No diagnosis recorded.';
    let parts: string[] = [];
    if (a.primaryDiagnosis) parts.push(`The doctor's diagnosis: ${a.primaryDiagnosis}`);
    if (a.differentialDiagnoses?.length) parts.push(`Other possible conditions considered: ${a.differentialDiagnoses.join(', ')}`);
    if (a.clinicalImpression || a.clinicalRationale || a.medicalDecisionMaking) {
      parts.push(`Doctor's reasoning: ${a.clinicalImpression || a.clinicalRationale || a.medicalDecisionMaking}`);
    }
    return parts.join('\n\n') || JSON.stringify(a);
  }

  plainEnglishPlan(p: any): string {
    if (!p) return 'No treatment plan recorded.';
    let parts: string[] = [];
    if (p.medicationsAndRx) parts.push(`Medicines prescribed for you:\n${p.medicationsAndRx}`);
    if (p.diagnosticOrders) parts.push(`Tests or scans ordered: ${p.diagnosticOrders}`);
    if (p.patientEducation) parts.push(`Important information for you: ${p.patientEducation}`);
    if (p.followUp) parts.push(`Next steps: ${p.followUp}`);
    if (p.redFlagWarnings) parts.push(`⚠️ Warning signs to watch for:\n${p.redFlagWarnings}`);
    return parts.join('\n\n') || JSON.stringify(p);
  }

  // --- PDF generation for Rx Label ---
  generateRxLabel(note: any) {
    const patient = this.getMockPatientForNote(note);
    const labelHtml = `
      <div style="font-family: Arial, sans-serif; width: 400px; padding: 24px; border: 2px solid #333;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 12px;">
          <h2 style="margin: 0; font-size: 18px;">ScribeOS Pharmacy</h2>
          <p style="margin: 4px 0 0; font-size: 10px; color: #666;">123 Healthway Drive, Suite 400, NY 10001 | (555) 234-5678</p>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span><strong>Patient:</strong> ${patient.name}</span>
            <span><strong>MRN:</strong> #${patient.mrn}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <span><strong>Age/Sex:</strong> ${patient.age} / ${patient.gender}</span>
            <span><strong>Date:</strong> ${new Date().toLocaleDateString()}</span>
          </div>
        </div>
        <div style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; margin-bottom: 12px;">
          <p style="margin: 0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Prescribed Medications</p>
          <p style="margin: 0; font-size: 13px; white-space: pre-wrap;">${this.parseMedications(note.plan)}</p>
        </div>
        <div style="font-size: 11px; margin-bottom: 12px;">
          <p style="margin: 2px 0;"><strong>Prescriber:</strong> Dr. Sarah Chen, MD</p>
          <p style="margin: 2px 0;"><strong>NPI:</strong> 1098237461 | <strong>DEA:</strong> XC9823412</p>
          <p style="margin: 2px 0;"><strong>Rx ID:</strong> ${note.id.substring(0, 8)}</p>
        </div>
        <div style="border-top: 1px dashed #999; padding-top: 8px; font-size: 9px; color: #888; text-align: center;">
          Substitution permitted unless "Dispense as written" is specified. Keep out of reach of children.
        </div>
      </div>
    `;
    const container = document.createElement('div');
    container.innerHTML = labelHtml;
    document.body.appendChild(container);
    const html2pdfLib = (window as any).html2pdf;
    if (html2pdfLib) {
      html2pdfLib().set({
        margin: 0.3,
        filename: `RxLabel_${note.id.substring(0, 8)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: [5, 3.5], orientation: 'landscape' }
      }).from(container.firstElementChild).save().then(() => {
        document.body.removeChild(container);
      });
    } else {
      alert('PDF library not loaded. Please refresh and try again.');
      document.body.removeChild(container);
    }
  }

  // --- Patient PDF download (checks isSigned) ---
  downloadPatientPdf(note: any) {
    if (!note.isSigned) {
      alert('This clinical note has not been officially signed by the doctor yet. You can only download the official record once it has been signed.');
      return;
    }
    
    const patient = this.getMockPatientForNote(note);
    // Build a read-only PDF from the SOAP note data
    const pdfHtml = `
      <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; color: #1e293b;">
        <div style="text-align: center; font-size: 9px; letter-spacing: 2px; color: #94a3b8; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 24px; text-transform: uppercase;">
          Official Electronic Medical Record — Read Only Copy — Do Not Modify
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
          <div>
            <h1 style="margin: 0; font-size: 24px; color: #0f172a;">Mercy Hospital</h1>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Department of Primary Care & Internal Medicine</p>
          </div>
          <div style="text-align: right; border-left: 2px solid #e2e8f0; padding-left: 16px;">
            <p style="margin: 0; font-weight: bold; font-size: 16px;">Dr. Sarah Chen, MD</p>
            <p style="margin: 2px 0; color: #64748b; font-size: 12px;">NPI: 1098237461</p>
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; font-size: 13px;">
          <div><strong>Patient:</strong> ${patient.name}<br><strong>Age:</strong> ${patient.age} ${patient.gender}<br><strong>MRN:</strong> #${patient.mrn}</div>
          <div style="text-align: right;"><strong>Date:</strong> ${new Date(note.created_at).toLocaleString()}<br><strong>Encounter:</strong> Internal Medicine</div>
        </div>
        <h2 style="font-size: 14px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">1. Subjective</h2>
        <div style="font-size: 13px; margin-bottom: 20px; white-space: pre-wrap;">${note.subjective?.chiefComplaint ? '<strong>Chief Complaint:</strong> ' + note.subjective.chiefComplaint + '<br>' : ''}${note.subjective?.historyOfPresentIllness ? '<strong>HPI:</strong> ' + note.subjective.historyOfPresentIllness : ''}</div>
        <h2 style="font-size: 14px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">2. Objective</h2>
        <div style="font-size: 13px; margin-bottom: 20px; white-space: pre-wrap;">${note.objective?.physicalExam || JSON.stringify(note.objective || {})}</div>
        <h2 style="font-size: 14px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">3. Assessment</h2>
        <div style="font-size: 13px; margin-bottom: 20px; white-space: pre-wrap;">${note.assessment?.primaryDiagnosis ? '<strong>Primary Diagnosis:</strong> ' + note.assessment.primaryDiagnosis + '<br>' : ''}${this.parseAssessment(note.assessment)}</div>
        <h2 style="font-size: 14px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">4. Plan</h2>
        <div style="font-size: 13px; margin-bottom: 20px; white-space: pre-wrap;">${this.parseMedications(note.plan)}</div>
        <div style="margin-top: 40px; padding-top: 16px; border-top: 2px solid #1e293b; font-size: 12px;">
          <p style="margin: 0; font-weight: bold;">This document is an electronically generated, read-only copy.</p>
          <p style="margin: 4px 0; color: #64748b;">Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
    const container = document.createElement('div');
    container.innerHTML = pdfHtml;
    document.body.appendChild(container);
    const html2pdfLib = (window as any).html2pdf;
    if (html2pdfLib) {
      html2pdfLib().set({
        margin: 0.5,
        filename: `Clinical_Summary_${note.id.substring(0, 8)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }).from(container.firstElementChild).save().then(() => {
        document.body.removeChild(container);
      });
    } else {
      alert('PDF library not loaded.');
      document.body.removeChild(container);
    }
  }

  parseAssessment(assessment: any): string {
    if (!assessment) return 'No assessment provided.';
    if (typeof assessment === 'string') return assessment;
    if (assessment.medicalDecisionMaking) return assessment.medicalDecisionMaking;
    if (assessment.diagnoses) return JSON.stringify(assessment.diagnoses);
    return JSON.stringify(assessment);
  }

  handleLogin(e: Event) {
    e.preventDefault();
    const email = this.loginEmail.toLowerCase();
    if (email === 'dr.sarah@scribe.ai' || email === 'admin@scribe.ai' || email === 'nurse@scribe.ai' || email === 'pharmacist@scribe.ai' || email === 'patient@scribe.ai') {
      this.isLoggedIn = true;
      this.loginError = false;
      if (email.includes('admin')) this.loginRole = 'Administrator';
      else if (email.includes('nurse')) this.loginRole = 'Nurse';
      else if (email.includes('pharmacist')) {
        this.loginRole = 'Pharmacist';
        this.loadPharmacistData();
      }
      else if (email.includes('patient')) {
        this.loginRole = 'Patient';
        this.loadPharmacistData();
      }
      else this.loginRole = 'Doctor';
    } else {
      this.loginError = true;
    }
  }

  handleLogout() {
    if (this.pollInterval) clearInterval(this.pollInterval);

    this.isLoggedIn = false;
    this.loginEmail = 'dr.sarah@scribe.ai';
    this.loginPassword = 'password123';
    this.pharmacistView = 'queue';
    this.viewingChartNote = null;
    this.viewingSummaryNote = null;
  }

  private simulationInterval: any = null;

  get fhirPayload(): string {
    const fhirDoc = {
      resourceType: "DocumentReference",
      status: "current",
      type: {
        coding: [{ system: "http://loinc.org", code: "34109-9", display: "Comprehensive history and physical note" }]
      },
      subject: {
        reference: `Patient/${this.activeEncounter.patient.mrn}`,
        display: this.privacyMode ? "*** MASKED ***" : this.activeEncounter.patient.fullName
      },
      date: new Date().toISOString(),
      content: [{
        attachment: {
          contentType: "application/json",
          data: btoa(JSON.stringify(this.soapNote, null, 2))
        }
      }]
    };
    return JSON.stringify(fhirDoc, null, 2);
  }

  get visibleUtterances() {
    return this.activeEncounter.utterances.slice(0, this.visibleUtteranceCount);
  }

  handleSelectEncounter(encId: string) {
    const enc = this.encounters.find(e => e.id === encId);
    if (!enc) return;
    this.currentEncounterId = encId;
    this.soapNote = { ...enc.soap };
    this.entities = [...enc.entities];
    this.visibleUtteranceCount = enc.utterances.length;
    this.timerSeconds = enc.utterances[enc.utterances.length - 1]?.timeSec || 60;
    this.isSimulating = false;
    this.isRecording = false;
    this.selectedEntityId = null;
    this.clearInterval();
  }

  handleToggleSimulation() {
    if (this.isSimulating) {
      this.isSimulating = false;
      this.clearInterval();
    } else {
      if (this.visibleUtteranceCount >= this.activeEncounter.utterances.length) {
        this.visibleUtteranceCount = 1;
        this.timerSeconds = this.activeEncounter.utterances[0]?.timeSec || 5;
      }
      this.isSimulating = true;
      this.simulationInterval = setInterval(() => {
        this.timerSeconds++;
        if (this.visibleUtteranceCount < this.activeEncounter.utterances.length) {
          this.visibleUtteranceCount++;
        } else {
          this.isSimulating = false;
          this.clearInterval();
          // Automatically trigger AI generation when the conversation finishes
          this.handleRegenerateNote();
        }
      }, 3000);
    }
  }

  isArchModalOpen = false;
  
  // Speech Recognition
  private recognition: any = null;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = async (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        
        // Append actual spoken text to the transcript UI
        const newUtterance: TranscriptUtterance = {
          id: 'live-' + Date.now(),
          speaker: 'doctor',
          speakerName: 'Dr. Sarah Chen, MD',
          text: transcript,
          timestamp: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
          timeSec: this.timerSeconds,
          confidence: 0.99
        };
        
        const encounter = this.activeEncounter;
        encounter.utterances.push(newUtterance);
        this.visibleUtteranceCount = encounter.utterances.length;

        try {
          // Attempt to push real-time message to backend queue
          await firstValueFrom(this.messagesService.submitMessage(encounter.id as string, { speaker: 'doctor' as any, content: transcript, category: 'general' as any }).pipe(timeout(3000)));
        } catch(e) {
          console.debug("Backend offline, skipping message enqueue");
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
      };
    }
  }

  handleToggleRecording() {
    if (this.captureMode !== 'microphone') {
      this.captureMode = 'microphone';
    }
    
    this.isRecording = !this.isRecording;
    if (this.isRecording) {
      // Start the mock timer
      this.simulationInterval = setInterval(() => this.timerSeconds++, 1000);
      
      // Start actual microphone transcription
      if (this.recognition) {
        try {
          this.recognition.start();
        } catch (e) { console.error('Mic error:', e); }
      } else {
        alert("Your browser does not support live speech recognition. Try Chrome or Edge.");
      }
    } else {
      this.clearInterval();
      // Stop microphone
      if (this.recognition) {
        this.recognition.stop();
      }
    }
  }

  handleFastForwardAll() {
    this.visibleUtteranceCount = this.activeEncounter.utterances.length;
    this.timerSeconds = this.activeEncounter.utterances[this.activeEncounter.utterances.length - 1]?.timeSec || 142;
    this.isSimulating = false;
    this.clearInterval();
    // Automatically trigger AI generation when fast-forwarding to the end
    this.handleRegenerateNote();
  }

  handleResetStream() {
    this.visibleUtteranceCount = 1;
    this.timerSeconds = this.activeEncounter.utterances[0]?.timeSec || 5;
    this.isSimulating = false;
    this.clearInterval();
  }

  changeCaptureMode(mode: 'simulation' | 'microphone' | 'upload') {
    this.captureMode = mode;
  }

  selectEntity(entityId: string) {
    this.selectedEntityId = entityId;
    this.leftRailTab = 'entities';
  }

  handleInsertEntityToSoap(event: {entity: any, section: string}) {
    const { entity, section } = event;
    const termWithCode = `${entity.term} (${entity.code})`;
    if (section === 'assessment') {
      this.soapNote = {
        ...this.soapNote,
        assessment: {
          ...this.soapNote.assessment,
          differentialDiagnoses: [...new Set([...this.soapNote.assessment.differentialDiagnoses, termWithCode])],
          clinicalImpression: this.soapNote.assessment.clinicalImpression + `\n• Verified finding: ${termWithCode}.`,
        },
      };
    } else if (section === 'plan') {
      this.soapNote = {
        ...this.soapNote,
        plan: { ...this.soapNote.plan, medicationsAndRx: this.soapNote.plan.medicationsAndRx + `\n• ${termWithCode}` },
      };
    } else {
      this.soapNote = {
        ...this.soapNote,
        subjective: { ...this.soapNote.subjective, reviewOfSystems: this.soapNote.subjective.reviewOfSystems + `\n• Pertinent finding: ${termWithCode}` },
      };
    }
  }

  handleToggleEntityVerification(entityId: string) {
    this.entities = this.entities.map(e =>
      e.id === entityId ? { ...e, status: e.status === 'verified' ? 'flag' : 'verified' } : e
    );
  }

  handleConfirmSignoff(event: {doctorName: string, credentials: string}) {
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
    });
    this.soapNote = { ...this.soapNote, isSigned: true, signedBy: event.doctorName, signedAt: timestamp };
  }

  handleUpdateSoapNote(updated: SoapNote) {
    this.soapNote = updated;
  }

  handleOpenRefineModal(event: {key: string, title: string, text: string}) {
    this.refineModalState = { isOpen: true, sectionKey: event.key, sectionTitle: event.title, currentText: event.text };
  }

  handleApplyRefinedContent(event: {sectionKey: string, newContent: string}) {
    const { sectionKey, newContent } = event;
    if (sectionKey === 'subjective') {
      this.soapNote = { ...this.soapNote, subjective: { ...this.soapNote.subjective, historyOfPresentIllness: newContent } };
    } else if (sectionKey === 'objective') {
      this.soapNote = { ...this.soapNote, objective: { ...this.soapNote.objective, physicalExam: newContent } };
    } else if (sectionKey === 'assessment') {
      this.soapNote = { ...this.soapNote, assessment: { ...this.soapNote.assessment, clinicalImpression: newContent } };
    } else if (sectionKey === 'plan') {
      this.soapNote = { ...this.soapNote, plan: { ...this.soapNote.plan, medicationsAndRx: newContent } };
    }
  }

  handleAddPrivateNote(noteText: string) {
    const newNote = {
      id: 'note-' + Date.now(),
      speaker: 'system' as const,
      speakerName: 'Dr. Private Note',
      text: noteText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeSec: this.timerSeconds,
      confidence: 1.0,
      isNote: true
    };
    this.activeEncounter.utterances.push(newNote);
      this.visibleUtteranceCount++;
  }

  async handleRegenerateNote() {
    this.isGenerating = true;
    
    try {
      // Build transcript text from the visible utterances
      const transcript = this.activeEncounter.utterances
        .slice(0, this.visibleUtteranceCount)
        .map(u => `${u.speakerName}: ${u.text}`)
        .join('\n');

      // Call gemini-service directly for real AI SOAP generation (bypasses slow queue for demo)
      const response = await fetch('http://localhost:4002/generate-soap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript,
          patientContext: {
            name: this.activeEncounter.patient.fullName,
            age: this.activeEncounter.patient.age,
            sex: this.activeEncounter.patient.gender,
          }
        })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.error?.message || `Gemini returned ${response.status}`);
      }

      const realSoap = await response.json();
      
      if (realSoap && realSoap.subjective) {
        // Map AI-generated SOAP to our UI structure
        this.soapNote = {
          subjective: {
            chiefComplaint: realSoap.subjective?.chiefComplaint || '',
            historyOfPresentIllness: realSoap.subjective?.historyOfPresentIllness || '',
            reviewOfSystems: (realSoap.subjective?.reviewOfSystems || []).join(', '),
            currentMedications: (realSoap.subjective?.currentMedications || []).join(', '),
            allergies: (realSoap.subjective?.allergies || []).join(', '),
          },
          objective: {
            vitalSigns: realSoap.objective?.vitalSigns || {},
            physicalExam: (realSoap.objective?.physicalExam || []).join('\n'),
            labResults: (realSoap.objective?.labDiagnosticResults || []).join('\n'),
          },
          assessment: {
            primaryDiagnosis: realSoap.assessment?.primaryDiagnosis || '',
            differentialDiagnoses: realSoap.assessment?.differentialDiagnoses || [],
            clinicalImpression: realSoap.assessment?.clinicalRationale || '',
          },
          plan: {
            medicationsAndRx: (realSoap.plan?.medicationsPrescribed || [])
              .map((m: any) => `${m.name} ${m.dosage} ${m.frequency} x ${m.duration} — ${m.instructions}`)
              .join('\n'),
            diagnosticOrders: (realSoap.plan?.diagnosticOrders || []).join('\n'),
            patientEducation: (realSoap.plan?.patientEducation || []).join('\n'),
            followUp: realSoap.plan?.followUp || '',
            redFlagWarnings: (realSoap.plan?.redFlagWarnings || []).join('\n'),
          },
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSigned: false,
        } as any;

        // Securely save directly to Supabase via RLS
        try {
          const { error } = await supabase.from('soap_notes').insert({
            id: crypto.randomUUID(),
            session_id: '00000000-0000-0000-0000-000000000000', // Mock session ID for demo
            subjective: this.soapNote.subjective,
            objective: this.soapNote.objective,
            assessment: this.soapNote.assessment,
            plan: this.soapNote.plan,
            source: 'gemini',
            version: 1
          });
          if (error) console.error("Supabase Save Error:", error);

          try {
            fetch('http://localhost:4001/scribe/pharmacy/alert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: '00000000-0000-0000-0000-000000000000',
                medications: (this.soapNote.plan as any)?.medications || []
              })
            }).then(res => console.log('Pharmacy Alert Status:', res.status));
          } catch(e) { console.log(e); }

        } catch(supabaseErr) {
          console.error("Failed to connect to Supabase:", supabaseErr);
        }

        this.showToast('✅ AI SOAP note generated successfully by Gemini and saved to DB!', 'success');
      } else {
        throw new Error('Gemini returned empty response');
      }
    } catch (e) {
      console.warn("Backend API call failed. Falling back to local mock generation for UI demo purposes.", e);
      this.showToast("Backend API offline or slow. Falling back to local offline generation.", "info");
      
      // Mock Fallback Generation
      setTimeout(() => {
        this.soapNote = { 
          ...this.activeEncounter.soap, 
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          isSigned: false 
        };
        this.isGenerating = false;
      }, 1500);
    } finally {
      this.isGenerating = false;
    }
  }

  openArchitectureSpec() {}

  private clearInterval() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
}

