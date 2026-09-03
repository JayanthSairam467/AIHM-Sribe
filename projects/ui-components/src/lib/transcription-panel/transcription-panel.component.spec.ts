import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranscriptionPanelComponent } from './transcription-panel.component';

describe('TranscriptionPanelComponent', () => {
  let component: TranscriptionPanelComponent;
  let fixture: ComponentFixture<TranscriptionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranscriptionPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TranscriptionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
