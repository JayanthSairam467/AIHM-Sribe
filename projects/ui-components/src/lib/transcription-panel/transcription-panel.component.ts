import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  User, 
  Stethoscope, 
  Search, 
  Clock, 
  Volume2,
  Flag,
  Copy,
  Check,
  MessageSquarePlus,
  ArrowDownCircle,
  Radio
} from 'lucide-angular';

@Component({
  selector: 'lib-transcription-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './transcription-panel.component.html',
  host: { 'class': 'flex-1 flex flex-col min-h-0 w-full overflow-hidden' }
})
export class TranscriptionPanelComponent implements OnChanges {
  @Input() utterances: any[] = [];
  @Input() allEntities: any[] = [];
  @Input() selectedEntityId?: string | null = null;
  @Input() isStreaming = false;
  
  @Output() selectEntity = new EventEmitter<string>();
  @Output() addPrivateNote = new EventEmitter<string>();

  @ViewChild('scrollContainer') scrollContainerRef!: ElementRef;

  searchQuery = '';
  viewFilter: 'all' | 'doctor' | 'patient' | 'flags' | 'notes' = 'all';
  scratchpadText = '';
  autoScroll = true;
  copiedId: string | null = null;

  readonly User = User;
  readonly Stethoscope = Stethoscope;
  readonly Search = Search;
  readonly Clock = Clock;
  readonly Volume2 = Volume2;
  readonly Flag = Flag;
  readonly Copy = Copy;
  readonly Check = Check;
  readonly MessageSquarePlus = MessageSquarePlus;
  readonly ArrowDownCircle = ArrowDownCircle;
  readonly Radio = Radio;

  get filteredUtterances() {
    return this.utterances.filter(u => {
      let matchesView = true;
      if (this.viewFilter === 'doctor') matchesView = u.speaker === 'doctor';
      if (this.viewFilter === 'patient') matchesView = u.speaker === 'patient';
      if (this.viewFilter === 'flags') matchesView = !!u.isFlagged;
      if (this.viewFilter === 'notes') matchesView = !!u.isNote;
      
      const matchesSearch = this.searchQuery === '' || 
        u.text.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        u.speakerName.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      return matchesView && matchesSearch;
    });
  }

  setViewFilter(filter: 'all' | 'doctor' | 'patient' | 'flags' | 'notes') {
    this.viewFilter = filter;
    this.scrollToBottom();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['utterances']) {
      const curr = changes['utterances'].currentValue || [];
      const prev = changes['utterances'].previousValue || [];
      // Only scroll if a new utterance was added and autoScroll is active
      if (curr.length !== prev.length && this.autoScroll) {
        this.scrollToBottom();
      }
    }
  }

  onScroll(event: Event) {
    const el = event.target as HTMLElement;
    // If user scrolls up significantly, turn off autoScroll
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 20;
    this.autoScroll = isAtBottom;
  }

  scrollToBottom() {
    this.autoScroll = true;
    setTimeout(() => {
      if (this.scrollContainerRef) {
        const el = this.scrollContainerRef.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    });
  }

  getEntity(id: string) {
    return this.allEntities.find(e => e.id === id);
  }

  toggleFlag(turn: any) {
    turn.isFlagged = !turn.isFlagged;
  }

  handleCopy(turn: any) {
    navigator.clipboard.writeText(`[${turn.speakerName}]: ${turn.text}`);
    this.copiedId = turn.id;
    setTimeout(() => this.copiedId = null, 2000);
  }

  submitNote() {
    if (!this.scratchpadText.trim()) return;
    this.addPrivateNote.emit(this.scratchpadText);
    this.scratchpadText = '';
    this.scrollToBottom();
  }
}
