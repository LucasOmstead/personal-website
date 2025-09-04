import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PastMoves, Player, Defector, Cooperator, GrimTrigger, RandomChooser, TitForTat, TwoTitForTat, CooperativeTitForTat, SuspiciousTitForTat, ModelPlayer, You} from'../services/game.service';
import { FormsModule } from '@angular/forms';
import {MatSliderModule} from '@angular/material/slider';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
@Component({
  selector: 'app-play-game',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSliderModule, MatButtonModule, MatInputModule],
  templateUrl: './play-game.component.html',
  styleUrl: './play-game.component.scss'
})
export class PlayGameComponent implements OnInit, OnDestroy {
  //Playing 1 match against a single player
  @Input() opponent!: Player;
  @Input() rounds!: number; 
  @Output() results = new EventEmitter<[number[], number[]]>();
  
  curMatch: [number[], number[]] = [[], []];
  private keysPressed: Set<string> = new Set(); // Track which keys are currently pressed

  ngOnInit(): void {
    // Event listeners are handled by @HostListener decorators
  }

  ngOnDestroy(): void {
    // Event listeners are automatically cleaned up by @HostListener
  }

  // Handle keyboard shortcuts - only on initial keypress, not when held
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Prevent if user is typing in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = event.key.toLowerCase();
    
    // Only trigger if this key isn't already pressed (first press)
    if (this.keysPressed.has(key)) {
      return; // Key is already pressed, ignore
    }

    // Mark key as pressed
    this.keysPressed.add(key);

    let action: number | null = null;
    switch (key) {
      case 'c':
        event.preventDefault();
        action = 0; // Cooperate
        break;
      case 'd':
        event.preventDefault();
        action = 1; // Defect
        break;
    }

    if (action !== null) {
      // Directly execute game logic for keyboard - no debounce needed
      if (this.opponent instanceof You) {
        let userAction = action;
        let opponentAction = action;
        this.curMatch[0].push(userAction);
        this.curMatch[1].push(opponentAction);

        if (this.curMatch[0].length >= this.rounds) {
          this.results.emit(this.curMatch);
          this.curMatch = [[], []];
        }
      } else {
        let userAction = action;
        let opponentAction = this.opponent.get_action([this.curMatch[1], this.curMatch[0]], this.curMatch[0].length);

        this.curMatch[0].push(userAction);
        this.curMatch[1].push(opponentAction);

        if (this.curMatch[0].length >= this.rounds) {
          this.results.emit(this.curMatch);
          this.curMatch = [[], []];
        }
      }
    }
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    // Remove key from pressed set when released
    this.keysPressed.delete(key);
  }

  handleAction(action: number) {
    // Execute game logic for button clicks - no debounce needed with new key tracking
    if (this.opponent instanceof You) {
      let userAction = action;
      let opponentAction = action;
      this.curMatch[0].push(userAction);
      this.curMatch[1].push(opponentAction);

      if (this.curMatch[0].length >= this.rounds) {
        this.results.emit(this.curMatch);
        this.curMatch = [[], []];
      }
    } else {
      let userAction = action;
      let opponentAction = this.opponent.get_action([this.curMatch[1], this.curMatch[0]], this.curMatch[0].length);

      this.curMatch[0].push(userAction);
      this.curMatch[1].push(opponentAction);

      if (this.curMatch[0].length >= this.rounds) {
        this.results.emit(this.curMatch);
        this.curMatch = [[], []];
      }
    }
  }

  //so randomly end it when the user clicks the button and the length is > 4 or whatever

  //2 cases: either you're playing against another player, or you're playing against yourself
}
