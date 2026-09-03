import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, ShieldCheck, FileCheck } from 'lucide-angular';

@Component({
  selector: 'lib-signoff-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './signoff-modal.component.html',
})
export class SignoffModalComponent {
  @Input() isOpen = false;
  @Input() patient: any = {};
  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmSignoff = new EventEmitter<{doctorName: string, credentials: string}>();

  physicianName = 'Dr. Sarah Chen, MD';
  npiNumber = '1948201948';
  confirmedCheck = false;

  readonly X = X;
  readonly ShieldCheck = ShieldCheck;
  readonly FileCheck = FileCheck;

  handleSubmit() {
    if (!this.confirmedCheck) return;
    this.confirmSignoff.emit({
      doctorName: this.physicianName,
      credentials: `NPI: ${this.npiNumber} | Internal Medicine & Cardiology`
    });
    this.closeModal.emit();
  }
}
