import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioCaptureBarComponent } from './audio-capture-bar.component';

describe('AudioCaptureBarComponent', () => {
  let component: AudioCaptureBarComponent;
  let fixture: ComponentFixture<AudioCaptureBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioCaptureBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AudioCaptureBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
