import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle2, Clock, Check, Copy, Target } from 'lucide-angular';

@Component({
  selector: 'lib-entity-extraction-rail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './entity-extraction-rail.component.html',
  host: { 'class': 'flex-1 flex flex-col min-h-0 w-full overflow-hidden' }
})
export class EntityExtractionRailComponent {
  @Input() entities: any[] = [];
  @Input() selectedEntityId: string | null = null;
  @Output() selectEntity = new EventEmitter<string>();
  @Output() insertEntityToSoap = new EventEmitter<{entity: any, section: string}>();
  @Output() toggleEntityVerification = new EventEmitter<string>();

  activeCategory = 'all';
  copiedId: string | null = null;

  readonly CheckCircle2 = CheckCircle2;
  readonly Clock = Clock;
  readonly Check = Check;
  readonly Copy = Copy;
  readonly Target = Target;

  categories = [
    { id: 'all', label: 'All Entities' },
    { id: 'symptom', label: 'Symptoms' },
    { id: 'diagnosis', label: 'Diagnoses (ICD-10)' },
    { id: 'medication', label: 'Medications' },
    { id: 'allergy', label: 'Allergies' },
    { id: 'vital', label: 'Vitals (LOINC)' },
  ];

  get filteredEntities() {
    return this.activeCategory === 'all'
      ? this.entities
      : this.entities.filter(e => e.category === this.activeCategory);
  }

  getCategoryCount(catId: string) {
    return catId === 'all' ? this.entities.length : this.entities.filter(e => e.category === catId).length;
  }

  getCategoryBadgeClass(category: string) {
    switch (category) {
      case 'symptom': return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'diagnosis': return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'medication': return 'bg-teal-50 text-teal-900 border-teal-200';
      case 'allergy': return 'bg-rose-50 text-rose-900 border-rose-200 font-semibold';
      case 'vital': return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      default: return 'bg-slate-50 text-slate-900 border-slate-200';
    }
  }

  handleCopyCode(entity: any, event: Event) {
    event.stopPropagation();
    navigator.clipboard.writeText(`${entity.term} (${entity.code})`);
    this.copiedId = entity.id;
    setTimeout(() => this.copiedId = null, 1600);
  }
}
