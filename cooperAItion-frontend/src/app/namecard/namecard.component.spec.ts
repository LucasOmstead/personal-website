import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NamecardComponent } from './namecard.component';

describe('NamecardComponent', () => {
  let component: NamecardComponent;
  let fixture: ComponentFixture<NamecardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NamecardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NamecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
