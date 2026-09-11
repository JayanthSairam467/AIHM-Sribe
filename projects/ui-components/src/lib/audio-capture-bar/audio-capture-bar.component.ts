import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule,
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward,
  Upload
} from 'lucide-angular';

@Component({
  selector: 'lib-audio-capture-bar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './audio-capture-bar.component.html',
})
export class AudioCaptureBarComponent {
  @Input() isRecording = false;
  @Input() isSimulating = false;
  @Input() timerSeconds = 0;
  @Input() captureMode: 'simulation' | 'microphone' | 'upload' = 'simulation';
  @Input() activeUtteranceCount = 0;
  @Input() totalUtteranceCount = 0;
  
  @Output() toggleRecording = new EventEmitter<void>();
  @Output() toggleSimulation = new EventEmitter<void>();
  @Output() fastForwardAll = new EventEmitter<void>();
  @Output() resetStream = new EventEmitter<void>();
  @Output() changeCaptureMode = new EventEmitter<'simulation' | 'microphone' | 'upload'>();
  @Output() fileSelected = new EventEmitter<File>();
  decibels = -42;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileSelected.emit(input.files[0]);
    }
  }

  readonly Mic = Mic;
  readonly MicOff = MicOff;
  readonly Play = Play;
  readonly Pause = Pause;
  readonly RotateCcw = RotateCcw;
  readonly FastForward = FastForward;
  readonly Upload = Upload;

  formatTime(secs: number) {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  }

}
