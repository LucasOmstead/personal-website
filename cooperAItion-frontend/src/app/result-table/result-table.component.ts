import { Component, OnChanges } from '@angular/core';
import { Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchViewComponent } from "../match-view/match-view.component";

import {PastMoves, Player, Defector, Cooperator, GrimTrigger, RandomChooser, TitForTat, TwoTitForTat, CooperativeTitForTat, SuspiciousTitForTat, ModelPlayer, You} from'../services/game.service';


@Component({
  selector: 'app-result-table',
  standalone: true,
  imports: [CommonModule, MatchViewComponent],
  templateUrl: './result-table.component.html',
  styleUrl: './result-table.component.scss'
})

//So what we need is to:
//Play a game between every pair of players
//res should be stored in 3d array (2d for which players, 1d for res)
//At the end, display a number in each cell of the table; when the user hovers over the number they can see the match history (stored in table)

export class ResultTableComponent implements OnInit, OnChanges {
  @Input() scores: number[] = [];
  @Input() players: Player[] = [];
  @Input() payoffs: number[][] = [];
  @Input() matchResults: [number[], number[]][][] = [];
  @Input() totalRounds: number[] = [];
  @Input() averageScores: number[] = []; // Scores from first 5 rounds only
  @Input() averageRounds: number[] = []; // Rounds used for average calculation

  rankedPlayers: { index: number; score: number; averageScore: number; gamesPlayed: number }[] = [];
  selectedPlayer: number | null = null;
  playerFinished = true;
  userRank: number = 0;
  userWon: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.updateRankedPlayers();
  }

  ngOnChanges(): void {
    this.updateRankedPlayers();
  }

  private updateRankedPlayers(): void {
    if (this.scores.length > 0 && this.players.length > 0 && this.averageScores.length > 0 && this.averageRounds.length > 0) {
      // Create array of player indices, their scores, and average scores per round (from first 5 rounds only)
      this.rankedPlayers = this.scores.map((score, index) => ({
        index,
        score,
        averageScore: this.averageRounds[index] > 0 ? this.averageScores[index] / this.averageRounds[index] : 0,
        gamesPlayed: this.totalRounds[index]
      }));

      // Sort by average score in descending order
      this.rankedPlayers.sort((a, b) => b.averageScore - a.averageScore);
      
      // Find user's rank (assuming user is the last player)
      const userIndex = this.players.length - 1;
      this.userRank = this.rankedPlayers.findIndex(p => p.index === userIndex) + 1;
      this.userWon = this.userRank === 1;
    }
  }

  togglePlayerDetails(rank: number): void {
    this.selectedPlayer = this.selectedPlayer === rank ? null : rank;
  }
}

