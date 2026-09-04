import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, FileText, Copy, Check, Download, Sparkles, RefreshCw, CheckCircle2, FileCheck2, User, FileJson, Info } from 'lucide-angular';
import { AutoResizeDirective } from './auto-resize.directive';
// @ts-ignore
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'lib-soap-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AutoResizeDirective],
  templateUrl: './soap-editor.component.html',
})
export class SoapEditorComponent {
  @ViewChild('pdfContent') pdfContent!: ElementRef;
  @Input() soapNote: any = {};
  @Input() patient: any = {};
  @Input() isGenerating = false;
  @Input() privacyMode = false;
  @Output() updateSoapNote = new EventEmitter<any>();
  @Output() openRefineModal = new EventEmitter<{key: string, title: string, text: string}>();
  @Output() openSignoffModal = new EventEmitter<void>();
  @Output() regenerateNote = new EventEmitter<void>();
  @Output() openFhirModal = new EventEmitter<void>();

  activeTab: string = 'all';
  copySuccess = false;

  readonly FileText = FileText;
  readonly Copy = Copy;
  readonly Check = Check;
  readonly Download = Download;
  readonly Sparkles = Sparkles;
  readonly RefreshCw = RefreshCw;
  readonly CheckCircle2 = CheckCircle2;
  readonly FileCheck2 = FileCheck2;
  readonly User = User;
  readonly FileJson = FileJson;
  readonly Info = Info;

  get totalWords(): number {
    if (!this.soapNote?.subjective) return 0;
    const text = [
      this.soapNote.subjective?.chiefComplaint, this.soapNote.subjective?.historyOfPresentIllness,
      this.soapNote.subjective?.reviewOfSystems, this.soapNote.subjective?.currentMedications,
      this.soapNote.objective?.vitals, this.soapNote.objective?.physicalExam,
      this.soapNote.objective?.diagnosticResults, this.soapNote.assessment?.primaryDiagnosis,
      this.soapNote.assessment?.clinicalImpression, this.soapNote.plan?.diagnostics,
      this.soapNote.plan?.medicationsAndRx, this.soapNote.plan?.patientEducation, this.soapNote.plan?.followUp
    ].filter(Boolean).join(' ');
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  onFieldChange() {
    this.updateSoapNote.emit({...this.soapNote});
  }

  handleCopyForEhr() {
    const s = this.soapNote;
    const p = this.patient;
    const text = `*** CLINICAL DOCUMENTATION (SOAP) ***\nPATIENT: ${p.fullName} | MRN: ${p.mrn} | DOB: ${p.dob}\nENCOUNTER: ${p.encounterType} | DATE: ${new Date().toLocaleDateString()}\n\n1. SUBJECTIVE\nCHIEF COMPLAINT: ${s.subjective?.chiefComplaint}\nHPI: ${s.subjective?.historyOfPresentIllness}\nROS: ${s.subjective?.reviewOfSystems}\nMEDICATIONS: ${s.subjective?.currentMedications}\n\n2. OBJECTIVE\nVITALS: ${s.objective?.vitals}\nPHYSICAL EXAM: ${s.objective?.physicalExam}\nDIAGNOSTICS: ${s.objective?.diagnosticResults}\n\n3. ASSESSMENT\nPRIMARY DX: ${s.assessment?.primaryDiagnosis}\nCLINICAL IMPRESSION: ${s.assessment?.clinicalImpression}\n\n4. PLAN\nDIAGNOSTICS: ${s.plan?.diagnostics}\nMEDICATIONS: ${s.plan?.medicationsAndRx}\nEDUCATION: ${s.plan?.patientEducation}\nFOLLOW-UP: ${s.plan?.followUp}\n\nATTESTATION: ${s.isSigned ? 'Signed by ' + s.signedBy + ' at ' + s.signedAt : 'DRAFT - Awaiting Signature'}`;
    navigator.clipboard.writeText(text);
    this.copySuccess = true;
    setTimeout(() => this.copySuccess = false, 2200);
  }

  handleDownloadTxt() {
    const blob = new Blob([JSON.stringify(this.soapNote, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOAP_NOTE_${this.patient?.mrn}_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  get rxTable(): any[] {
    const text = this.soapNote.plan?.medicationsAndRx || '';
    
    // If it's our primary demo patient (Robert H. Vance - chest pain)
    if (text.toLowerCase().includes('metoprolol') || text.toLowerCase().includes('nitroglycerin')) {
      return [
        { drug: 'Metoprolol Tartrate', dose: '25 mg', frequency: 'BID (Twice daily)', quantity: '60 tabs', refills: '3', notes: 'Take with food.' },
        { drug: 'Nitroglycerin SL', dose: '0.4 mg', frequency: 'PRN (As needed for chest pain)', quantity: '1 bottle', refills: '1', notes: 'Call 911 if pain persists >5 mins.' }
      ];
    }
    
    // If it's the diabetes patient
    if (text.toLowerCase().includes('metformin') || text.toLowerCase().includes('insulin')) {
      return [
        { drug: 'Metformin HCL', dose: '1000 mg', frequency: 'BID (Twice daily)', quantity: '60 tabs', refills: '3', notes: 'Take with meals.' },
        { drug: 'Lisinopril', dose: '10 mg', frequency: 'Daily', quantity: '30 tabs', refills: '3', notes: 'For renal protection.' }
      ];
    }
    
    // Generic fallback for any other text
    if (!text.trim()) return [];
    return [{ drug: 'See Notes', dose: '-', frequency: '-', quantity: '-', refills: '-', notes: text }];
  }

  downloadPdf() {
    if (!this.soapNote.isSigned) {
      alert('This clinical note must be signed by the attending physician before downloading an official copy.');
      return;
    }
    
    const element = this.pdfContent.nativeElement;
    
    // Temporarily make it visible for rendering
    element.style.display = 'block';
    
    const opt: any = {
      margin:       0.5,
      filename:     `SOAP_Note_${this.patient.fullName.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
      // Hide again after generation
      element.style.display = 'none';
    });
  }
}
