import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchViewComponent } from './match-view.component';

describe('MatchViewComponent', () => {
  let component: MatchViewComponent;
  let fixture: ComponentFixture<MatchViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatchViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
