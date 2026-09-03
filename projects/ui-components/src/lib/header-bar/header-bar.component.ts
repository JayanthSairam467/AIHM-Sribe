import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  Activity, 
  FileCode2, 
  ShieldCheck, 
  Stethoscope, 
  Wifi, 
  UserCheck, 
  Info,
  CheckCircle2
} from 'lucide-angular';

@Component({
  selector: 'lib-header-bar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './header-bar.component.html',
})
export class HeaderBarComponent {
  @Input() isSigned = false;
  @Input() signedBy = '';
  @Input() hasGeminiKey = false;
  
  @Output() logout = new EventEmitter<void>();
  @Output() openArchitectureSpec = new EventEmitter<void>();

  readonly Stethoscope = Stethoscope;
  readonly Wifi = Wifi;
  readonly ShieldCheck = ShieldCheck;
  readonly UserCheck = UserCheck;
  readonly CheckCircle2 = CheckCircle2;
  readonly Activity = Activity;
  readonly FileCode2 = FileCode2;
}
