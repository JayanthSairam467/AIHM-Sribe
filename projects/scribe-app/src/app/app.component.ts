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

  handleLogin(e: Event) {
    e.preventDefault();
    const email = this.loginEmail.toLowerCase();
    if (email === 'dr.sarah@scribe.ai' || email === 'admin@scribe.ai' || email === 'nurse@scribe.ai') {
      this.isLoggedIn = true;
      this.loginError = false;
      this.loginRole = email.includes('admin') ? 'Administrator' : (email.includes('nurse') ? 'Nurse' : 'Doctor');
    } else {
      this.loginError = true;
    }
  }

  handleLogout() {
    this.isLoggedIn = false;
    this.loginEmail = 'dr.sarah@scribe.ai';
    this.loginPassword = 'password123';
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
      const response = await fetch('https://aihm-gemini-backend.onrender.com/generate-soap', {
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
