import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Sparkles, RefreshCw, Check } from 'lucide-angular';

@Component({
  selector: 'lib-refine-section-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './refine-section-modal.component.html',
})
export class RefineSectionModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() sectionKey = '';
  @Input() sectionTitle = '';
  @Input() currentContent = '';
  @Output() closeModal = new EventEmitter<void>();
  @Output() applyRefinedContent = new EventEmitter<{sectionKey: string, newContent: string}>();

  instruction = '';
  refinedText = '';
  isProcessing = false;

  readonly X = X;
  readonly Sparkles = Sparkles;
  readonly RefreshCw = RefreshCw;
  readonly Check = Check;

  quickPrompts = [
    'Format into concise clinical bullet points',
    'Include pertinent negative symptoms in detail',
    'Add cardiac risk assessment justification',
    'Expand patient instructions and warning red flags',
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentContent']) {
      this.refinedText = this.currentContent;
    }
  }

  handleRefine(customDirective?: string) {
    const directive = customDirective || this.instruction;
    if (!directive.trim()) return;
    this.isProcessing = true;
    // Simulate AI refinement with a timeout
    setTimeout(() => {
      this.refinedText = `${this.currentContent}\n\n• Addendum: Reviewed and updated per clinical directive: "${directive}"`;
      this.isProcessing = false;
    }, 800);
  }

  handleSave() {
    this.applyRefinedContent.emit({sectionKey: this.sectionKey, newContent: this.refinedText});
    this.closeModal.emit();
  }
}
