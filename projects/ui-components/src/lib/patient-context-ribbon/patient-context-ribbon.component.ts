import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, AlertTriangle, Calendar, ChevronDown, FileText, 
  MapPin, ShieldAlert, User, HeartHandshake, Eye, EyeOff
} from 'lucide-angular';

@Component({
  selector: 'lib-patient-context-ribbon',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './patient-context-ribbon.component.html',
})
export class PatientContextRibbonComponent {
  @Input() currentEncounter: any = { patient: { allergies: [] } };
  @Input() availableEncounters: any[] = [];
  @Input() privacyMode = false;
  
  @Output() selectEncounter = new EventEmitter<string>();
  @Output() togglePrivacy = new EventEmitter<void>();

  readonly AlertTriangle = AlertTriangle;
  readonly Calendar = Calendar;
  readonly ChevronDown = ChevronDown;
  readonly FileText = FileText;
  readonly MapPin = MapPin;
  readonly ShieldAlert = ShieldAlert;
  readonly User = User;
  readonly HeartHandshake = HeartHandshake;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
}
