import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayGameComponent } from './play-game.component';

describe('PlayGameComponent', () => {
  let component: PlayGameComponent;
  let fixture: ComponentFixture<PlayGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayGameComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
