import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityExtractionRailComponent } from './entity-extraction-rail.component';

describe('EntityExtractionRailComponent', () => {
  let component: EntityExtractionRailComponent;
  let fixture: ComponentFixture<EntityExtractionRailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityExtractionRailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EntityExtractionRailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
