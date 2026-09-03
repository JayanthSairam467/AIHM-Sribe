import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientContextRibbonComponent } from './patient-context-ribbon.component';

describe('PatientContextRibbonComponent', () => {
  let component: PatientContextRibbonComponent;
  let fixture: ComponentFixture<PatientContextRibbonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientContextRibbonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PatientContextRibbonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
