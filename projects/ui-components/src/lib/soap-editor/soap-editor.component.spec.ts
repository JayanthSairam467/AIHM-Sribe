import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoapEditorComponent } from './soap-editor.component';

describe('SoapEditorComponent', () => {
  let component: SoapEditorComponent;
  let fixture: ComponentFixture<SoapEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoapEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SoapEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
