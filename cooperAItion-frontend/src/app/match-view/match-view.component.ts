import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-match-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-view.component.html',
  styleUrl: './match-view.component.scss'
})
export class MatchViewComponent implements OnInit {
  @Input() match!: [number[], number[]];
  @Input() payoffs!: number[][];
  score: number = 0;

  ngOnInit() {
    for (let i = 0; i < this.match[0].length; i++) {
      this.score += this.payoffs[this.match[0][i]][this.match[1][i]];
    }
  }


  //display the overall score, tinted from red to blue
  //when you hover over it, expand to the right with the actual match history

}
