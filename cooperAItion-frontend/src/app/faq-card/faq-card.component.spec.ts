import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqCardComponent } from './faq-card.component';

describe('FaqCardComponent', () => {
  let component: FaqCardComponent;
  let fixture: ComponentFixture<FaqCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FaqCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
