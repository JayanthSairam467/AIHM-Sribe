import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SessionsService, TasksService, MessagesService, RecordsService } from 'api-client';
import { FormsModule } from '@angular/forms';
import { CLINICAL_ENCOUNTERS } from './data/mock-encounters';
import { ClinicalEncounter, SoapNote, MedicalEntity, TranscriptUtterance } from './types';
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
  loginEmail = '';
  loginPassword = '';
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
    this.loginEmail = '';
    this.loginPassword = '';
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
          // await firstValueFrom(this.messagesService.submitMessage(encounter.id, { speaker: 'doctor', content: transcript, category: 'general' }));
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
      // Attempt to call the real backend API (Task Process 3)
      // Note: firstValueFrom is used to convert Observable to Promise for async/await
      // const session = await firstValueFrom(this.sessionsService.createSession({ patientId: this.activeEncounter.patient.mrn, practitionerId: 'dr_sarah' }));
      // await firstValueFrom(this.tasksService.generateSoap(session.id));
      
      // Simulating network delay for now before throwing since backend is offline
      await new Promise(r => setTimeout(r, 800));
      throw new Error("Backend offline"); 
    } catch (e) {
      console.warn("Backend API not reachable (or actively developing). Falling back to local mock generation for UI demo purposes.");
      this.showToast("Backend API offline. Falling back to local offline generation.", "info");
      
      // Mock Fallback Generation
      setTimeout(() => {
        this.soapNote = { 
          ...this.activeEncounter.soap, 
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          isSigned: false 
        };
        this.isGenerating = false;
      }, 1500);
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
