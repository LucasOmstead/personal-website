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

  ngOnInit(): void {
    // Add keyboard event listener
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  ngOnDestroy(): void {
    // Remove keyboard event listener to prevent memory leaks
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
  }

  // Handle keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Prevent if user is typing in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'c':
        event.preventDefault();
        this.handleAction(0); // Cooperate
        break;
      case 'd':
        event.preventDefault();
        this.handleAction(1); // Defect
        break;
    }
  }

  handleAction(action: number) {
    // console.log(this.opponent);
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
    // console.log(this.curMatch);
  }

  //so randomly end it when the user clicks the button and the length is > 4 or whatever

  //2 cases: either you're playing against another player, or you're playing against yourself
}
