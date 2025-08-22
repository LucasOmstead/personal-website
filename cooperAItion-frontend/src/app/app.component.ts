import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NamecardComponent } from './namecard/namecard.component';
import { FaqCardComponent } from './faq-card/faq-card.component';
import { FormsModule } from '@angular/forms';
import {MatSliderModule} from '@angular/material/slider';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import { ApiService } from './services/api.service';
import { ResultTableComponent } from "./result-table/result-table.component";
import { PlayGameComponent } from './play-game/play-game.component';

import {PastMoves, Player, Defector, Cooperator, GrimTrigger, RandomChooser, TitForTat, TwoTitForTat, CooperativeTitForTat, SuspiciousTitForTat, ModelPlayer, You} from'./services/game.service';
// import { HttpClientModule } from '@angular/common/http';
// import { Inject } from '@angular/core';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,
    NamecardComponent,
    FaqCardComponent,
    ResultTableComponent,
    MatButtonModule,
    MatInputModule,
    MatSliderModule,
    FormsModule,  
    PlayGameComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})


/*
General overview:
4 pages, navigated from left to right. First page = title page, with info about each type of player. Second page =
explanation + form to choose the number of each strategy/player that the user will be playing against. Third page = game page
where the user plays against each model (including themselves). Fourth page = results/leaderboard page
*/


export class AppComponent implements OnInit {
  @ViewChild('formBorder') formBorderElement!: ElementRef;

  title = 'cooperaition-frontend';
  players = [{name: "Tit For Tat", 
            description: "I repeat your last move. Play nice!", 
            detailedDescription: "Repeats the opponent's last move. Performs well against a wide variety of opponents because of three key principles: being nice, retaliatory, and forgiving. However, it fails to exploit other agents like Always Cooperate.", 
            image: "assets/images/TitForTat.jpg"},
             {name: "Grim Trigger", 
              description: "I cooperate until you defect, then I defect for the rest of the game for revenge. Don't even try it.", 
              detailedDescription: "Starts off nice, but harshly punishes defection. While it performs poorly (especially in environments where accidental defection is possible) it does promote cooperation & heavily discourage defection.",
              image: "assets/images/GrimTrigger.webp"},
             {name: "Two Tit For Tat", 
              description: "I cooperate, unless you've defected twice in a row. Exploitable?",
              detailedDescription: "Cooperates unless the opponent has defected >= 2 times in a row. Is more forgiving, but also exploitable: opponents who figure out its strategy can simply defect every other move.",
              image: "assets/images/TwoTitForTat.png"},
             {name: "Cooperative Tit For Tat", 
              description: "I cooperate unless you've defected a certain percentage of the time. Don't get too greedy!", 
              detailedDescription: "Cooperates unless the opponent has defected >20% of the time. Works well in environments where accidental defection is possible, and limits the exploitation that comes with Two Tit For Tat.",
              image: "assets/images/CooperativeTitForTat.jpeg"},
             {name: "Always Cooperate", 
              description: "Hi, let's be friends!", 
              detailedDescription: "Always cooperates. Performs poorly in environments with many defectors, but works well with other cooperators or \"nice\" strategies",
              image: "assets/images/Cooperate.png"},
             {name: "Always Defect", 
              description: "I don't play well with others.", 
              detailedDescription: "Always defects. While it never loses against *individuals*, it performs poorly overall when some members of the population punish defections, like TitForTat",
              image: "assets/images/Defect.png"},
             {name: "Suspicious Tit For Tat", 
              description: "I'm like Tit For Tat, but I defect the first round. I'm literally impossible to beat!", 
              detailedDescription: "Defects the first round, then plays like TitForTat. While it ties with Always Defect (unlike TitForTat, which loses by 1 round), it tends to perform poorly overall due to triggering punishing strategies against other players.",
              image: "assets/images/SuspiciousTitForTat.webp"}, 
             {name: "Random Chooser", 
              description: "Heads I win, tails you lose!", 
              detailedDescription: "Random choice. Performs poorly due to causing other players to defect. Not included in the training set due to making Sim Jim get confused about who he's playing against.",
              image:"assets/images/RandomChooser.jpg"},
             {name: "Sim Jim", 
              description: "I've trained for this my entire life!",
              detailedDescription: "A model trained using simulated annealing. Fine-tuned to the particular environment, and will adopt different strategies based on other players in the environment.",
              image: "assets/images/SimJim.webp"},
             {name: "You!", 
              description: "A real life human. You'll destroy these bots!",
              detailedDescription: "Think carefully about what strategy you'll use. Exploitation runs the risk of triggering retaliation from strategies like Grim Trigger, while cooperation could lead to getting exploited by Always Defect.",
              image: "assets/images/Mirror.png"}
  ]

  playerMapping: {[key: string]: any} = {
      "Tit For Tat": TitForTat,
      "Grim Trigger": GrimTrigger,
      "Two Tit For Tat": TwoTitForTat,
      "Cooperative Tit For Tat": CooperativeTitForTat,
      "Always Cooperate": Cooperator,
      "Always Defect": Defector,
      "Suspicious Tit For Tat": SuspiciousTitForTat,
      // "Sim Jim": ModelPlayer - added manually
    }

  faqs = [
    {
      question: "What is the iterated prisoner's dilemma?",
      answer: "The iterated prisoner's dilemma is a repeated version of the Prisoner's Dilemma, in which you and an opponent can choose to cooperate (leading to a fairly high score for everyone) or defect (much higher score for yourself, lower score for your opponent). In the *iterated* prisoner's dilemma, each player is playing multiple rounds, so they can adapt their strategy based on the opponent's previous actions. Both the prisoner's dilemma and iterated prisoner's dilemma are classic problems in [game theory](https://en.wikipedia.org/wiki/Game_theory)."
    },
    {
      question: "What's the best strategy?",
      answer: "Tit For Tat is highly effective because it's *nice* (cooperates by default), *retaliatory* (punishes defection), and *forgiving* (returns to cooperation once the opponent does). It typically outperforms more complex strategies. However, the optimal strategy depends on the actions of other agents. Because you know exactly who you'll be playing against (though the order of your opponents is randomized) you can outperform Tit for Tat by playing carefully and trying to identify each opponent."
    },
    {
      question: "What is this game about?",
      answer: "This game lets you learn about different strategies in the iterated prisoner's dilemma. It's inspired by [The Evolution of Trust](https://ncase.me/trust/) by Nicky Case, but provides a more competitive experience and customizability."
    }
  ];
  playersList: Player[] = [];
  playersListIndex = 0; //current player you're playing a match against. No edge case b/c you're always playing against at least yourself and the model

  simJimModel = "";
  curPage = 0;
  maxPages = 4;
  model: string = "0".repeat(149);
  payoffs: number[][] = [[5, 0], [8, 2]];

  playerCounts: { [key: string]: number } = {
    "Tit For Tat": 1,
    "Grim Trigger": 1,
    "Two Tit For Tat": 1,
    "Cooperative Tit For Tat": 1,
    "Always Cooperate": 1,
    "Always Defect": 1,
    "Suspicious Tit For Tat": 1,
  };
  
  playerNames = Object.entries(this.playerCounts);
  
  
  matchResults: [number[], number[]][][] = []
  playerScores: number[] = [];
  playerAverageScores: number[] = []; // Scores from first 5 rounds only (for average calculation)
  totalRounds: number[] = []; // Track total rounds played by each player
  averageRounds: number[] = []; // Track rounds used for average calculation (first 5 of each match)
  roundsMatrix: number[][] = []; // Matrix storing predetermined rounds for each player pair
  allGamesComplete: boolean = false; // Track if all games are finished
  orderMap!: { [key: number]: number };
  roundsPerPlayer!: { [key: number]: number };
  Math = Math; // Make Math available in template
  constructor(private apiService: ApiService) {
  }

  changePage = async (newPage: number) => {
    if (newPage == 1) {
      this.playersList = []; //in case they're going back to change the user list
      this.curPage = newPage;
      
      setTimeout(() => {this.setValue("Tit For Tat", {target: {value: 1}});}, 20); //call setValue to change the form's border color (maybe not best practice...)
      return;
    }

    if (this.curPage == 1 && newPage == 2) {
      //create the list of all players
      for (let p of this.playerNames) {
        let playerName = p[0];
        for (let i = 0; i < this.playerCounts[playerName]; i++) {
          this.playersList.push(new this.playerMapping[playerName]());
        }
      }
      
      const res = await this.apiService.getModel(this.playerCounts, this.payoffs).toPromise();
      this.model = res["model"];
      this.playersList.push(new ModelPlayer(BigInt("0b"+this.model)));
      this.playersList.push(new You());

      // Initialize arrays with the correct size after all players are added
      const numPlayers = this.playersList.length;
      this.matchResults = Array(numPlayers).fill(null).map(() => Array(numPlayers).fill(null).map(() => [[], []]));
      this.playerScores = Array(numPlayers).fill(0);
      this.playerAverageScores = Array(numPlayers).fill(0);
      this.totalRounds = Array(numPlayers).fill(0);
      this.averageRounds = Array(numPlayers).fill(0);
      this.allGamesComplete = false; // Reset when starting new game
      this.playersListIndex = 0; // Reset player index

      this.curPage = newPage;
      const setup = this.gameSetup();
      this.orderMap = setup.orderMap;
      this.roundsPerPlayer = setup.roundsPerPlayer;
      this.calculateScores();
      return;
    }

    this.curPage = newPage;
    return;
  };

  resetAndGoToPlayerSelection = () => {
    // Reset all game-related data
    this.playersList = [];
    this.matchResults = [];
    this.playerScores = [];
    this.playerAverageScores = [];
    this.totalRounds = [];
    this.averageRounds = [];
    this.roundsMatrix = [];
    this.allGamesComplete = false;
    this.playersListIndex = 0;
    this.orderMap = {};
    this.roundsPerPlayer = {};
    this.model = "";
    
    // Go to player selection page (page 1)
    this.curPage = 1;
  };

  getNumRounds(): number {
    let rounds = 5; // Start with minimum 5 rounds
    // Keep adding rounds with 60% probability until we hit 10 rounds
    while (rounds < 10 && Math.random() < 0.6) {
      rounds++;
    }
    return rounds;
  }

  //doesn't even have to be a function tbh, can just set curPlayer to the first in playerNames
  //*ngFor component in playerNames
  //play that game, in the event receiver function in app.component just 
  //append the results from the event and begin a new game
  //right?
  async calculateScores() {
    const n = this.playersList.length;
    const modelPlayerIndex = n - 2; // Second to last player is the model
    const humanPlayerIndex = n - 1; // Last player is human

    // For each pair of players (excluding human player - they'll be counted when manually played)
    for (let i = 0; i < n - 1; i++) {
      for (let j = i; j < n - 1; j++) {
        // Use predetermined rounds from the matrix
        const numRounds = this.roundsMatrix[i][j];
        
        const result = this.playGameWithRounds(this.playersList[i], this.playersList[j], numRounds);

        const [moves, score1, score2, avgScore1, avgScore2] = result;
        
        // Store results symmetrically
        this.matchResults[i][j] = moves;
        this.matchResults[j][i] = [moves[1], moves[0]]; // Swap the moves for the opposite perspective
        
        // Update total scores and average scores
        this.playerScores[i] += score1;
        this.playerScores[j] += score2;
        this.playerAverageScores[i] += avgScore1;
        this.playerAverageScores[j] += avgScore2;
        this.totalRounds[i] += numRounds;
        this.totalRounds[j] += numRounds;
        // For averages, only count the first 5 rounds
        const roundsForAverage = Math.min(numRounds, 5);
        this.averageRounds[i] += roundsForAverage;
        this.averageRounds[j] += roundsForAverage;
      }
    }
  }

  playGameWithRounds(p1: Player, p2: Player, rounds: number): [[number[], number[]], number, number, number, number] {
    let past_moves: [number[], number[]] = [[], []];
    let score1 = 0;
    let score2 = 0;
    let avgScore1 = 0; // Score from first 5 rounds only
    let avgScore2 = 0; // Score from first 5 rounds only

    for (let i = 0; i < rounds; i++) {
      let p1_action = p1.get_action(past_moves, i);
      let p2_action = p2.get_action([past_moves[1], past_moves[0]], i);
      
      const roundScore1 = this.payoffs[p1_action][p2_action];
      const roundScore2 = this.payoffs[p2_action][p1_action];
      
      score1 += roundScore1;
      score2 += roundScore2;
      
      // Only count scores from first 5 rounds for average calculation
      if (i < 5) {
        avgScore1 += roundScore1;
        avgScore2 += roundScore2;
      }
      
      past_moves[0].push(p1_action);
      past_moves[1].push(p2_action);
    }
    return [past_moves, score1, score2, avgScore1, avgScore2];
  }
  gameSetup(): { orderMap: { [key: number]: number }, roundsPerPlayer: { [key: number]: number } } {
    // Create array of indices excluding the You() player
    const playerIndices = Array.from(
      { length: this.playersList.length },
      (_, i) => i
    );

    // Randomly shuffle the array
    const shuffledIndices = playerIndices.sort(() => Math.random() - 0.5);

    // Create order map where key is the turn order (0 goes first) and value is the player index
    const orderMap: { [key: number]: number } = {};
    shuffledIndices.forEach((playerIndex, orderIndex) => {
      orderMap[orderIndex] = playerIndex;
    });

    // Generate number of rounds for each player
    const roundsPerPlayer: { [key: number]: number } = {};
    
    shuffledIndices.forEach(playerIndex => {
      roundsPerPlayer[playerIndex] = this.getNumRounds();
    });

    // Create rounds matrix for all player pairs
    const n = this.playersList.length;
    this.roundsMatrix = Array(n).fill(null).map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) { // Only iterate upper triangle to ensure symmetry
        if (i === j) {
          // Self-match: use that player's predetermined rounds
          this.roundsMatrix[i][j] = roundsPerPlayer[i];
        } else {
          // Cross-match: generate unique rounds for each match pair
          const matchRounds = this.getNumRounds();
          this.roundsMatrix[i][j] = matchRounds;
          this.roundsMatrix[j][i] = matchRounds; // Ensure symmetry
        }
      }
    }

    return {
      orderMap,
      roundsPerPlayer
    };
  }

  //either move to the next game or continue to leaderboard page
  gameFinished(matchResult: [number[], number[]]) {
    this.matchResults[this.playersList.length-1][this.orderMap[this.playersListIndex]] = matchResult;
    this.matchResults[this.orderMap[this.playersListIndex]][this.playersList.length-1] = [matchResult[1], matchResult[0]]; //swap the moves for the other player

    // Calculate and update scores for this match
    const humanMoves = matchResult[0];
    const opponentMoves = matchResult[1];
    let humanScore = 0;
    let opponentScore = 0;
    let humanAvgScore = 0; // Score from first 5 rounds only
    let opponentAvgScore = 0; // Score from first 5 rounds only

    for (let i = 0; i < humanMoves.length; i++) {
      const roundHumanScore = this.payoffs[humanMoves[i]][opponentMoves[i]];
      const roundOpponentScore = this.payoffs[opponentMoves[i]][humanMoves[i]];
      
      humanScore += roundHumanScore;
      opponentScore += roundOpponentScore;
      
      // Only count scores from first 5 rounds for average calculation
      if (i < 5) {
        humanAvgScore += roundHumanScore;
        opponentAvgScore += roundOpponentScore;
      }
    }

    // Add scores to the total
    this.playerScores[this.playersList.length-1] += humanScore;
    this.playerScores[this.orderMap[this.playersListIndex]] += opponentScore;
    this.playerAverageScores[this.playersList.length-1] += humanAvgScore;
    this.playerAverageScores[this.orderMap[this.playersListIndex]] += opponentAvgScore;
    
    // Add rounds to the total
    const roundsPlayed = humanMoves.length;
    this.totalRounds[this.playersList.length-1] += roundsPlayed;
    this.totalRounds[this.orderMap[this.playersListIndex]] += roundsPlayed;
    // For averages, only count the first 5 rounds
    const roundsForAverage = Math.min(roundsPlayed, 5);
    this.averageRounds[this.playersList.length-1] += roundsForAverage;
    this.averageRounds[this.orderMap[this.playersListIndex]] += roundsForAverage;

    if (this.playersListIndex < this.playersList.length-1) {
      this.playersListIndex += 1;
    } else {
      // All manual games complete, now add human self-match to match AI players
      this.addHumanSelfMatch();
      this.allGamesComplete = true;
      this.changePage(3);
    }
  }

  addHumanSelfMatch() {
    // Add a self-match for the human player to match what AI players get
    const humanPlayerIndex = this.playersList.length - 1;
    const humanRounds = this.roundsMatrix[humanPlayerIndex][humanPlayerIndex];
    
    // Play human vs human (self-match)
    const result = this.playGameWithRounds(this.playersList[humanPlayerIndex], this.playersList[humanPlayerIndex], humanRounds);
    const [moves, score1, score2, avgScore1, avgScore2] = result;
    
    // Store the self-match result
    this.matchResults[humanPlayerIndex][humanPlayerIndex] = moves;
    
    // Update scores for self-match (both scores go to the human player)
    this.playerScores[humanPlayerIndex] += score1;
    this.playerAverageScores[humanPlayerIndex] += avgScore1;
    this.totalRounds[humanPlayerIndex] += humanRounds;
    const roundsForAverage = Math.min(humanRounds, 5);
    this.averageRounds[humanPlayerIndex] += roundsForAverage;
  }

  ngOnInit() {
    window.addEventListener('keydown', (event) => {this.onKeyPress(event)});
  }

  onKeyPress(event: KeyboardEvent) {
    if (event["key"] == "ArrowLeft") {
      // Handle left arrow - match the back button behavior
      if (this.curPage == 1) {
        this.changePage(0); // View Players
      } else if (this.curPage == 2) {
        this.changePage(1); // Choose players
      } else if (this.curPage == 3) {
        this.resetAndGoToPlayerSelection(); // Choose players (with reset)
      }
    }
    if (event.key == "ArrowRight") {
      // Handle right arrow - match the forward button behavior
      if (this.curPage == 0) {
        this.changePage(1); // Choose players
      } else if (this.curPage == 1) {
        this.changePage(2); // Begin game
      }
      // No right arrow action on page 2 or 3 since there are no forward buttons
    }
  }

  //Set number of each player & change form border color
  setValue(player: string | null = null, event: any = null) {
    if (event != null && player != null) {
      this.playerCounts[player] = (Number)((event.target as HTMLInputElement).value);
    }
    
    //setting border of the form to show how "cooperative" the population is. Red = tends to defect, blue = tends to cooperate, purple = in between 
    let totalNiceness = 0;
    let numElements = 0;
    for (let i = 0; i < this.playerNames.length; i++) {
      numElements += this.playerCounts[this.playerNames[i][0]];
    } 
    totalNiceness += this.playerCounts["Always Cooperate"];
    totalNiceness += this.playerCounts["Two Tit For Tat"]*.9;
    totalNiceness += this.playerCounts["Cooperative Tit For Tat"]*.9;
    totalNiceness += this.playerCounts["Tit For Tat"]*.8;
    totalNiceness += this.playerCounts["Grim Trigger"]*.7;
    // totalNiceness += this.playerCounts["Random Chooser"]*.5;
    totalNiceness += this.playerCounts["Suspicious Tit For Tat"]*.4;
    totalNiceness += this.playerCounts["Always Defect"]*0; //just for consistency :)

    let value = totalNiceness / numElements;
    //having higher rewards for defection should make value lower
    //so cooperate / (cooperate + defect)
    value = (value + Math.max(Math.min(this.payoffs[0][0]/this.payoffs[1][0], 1), 0))/2;
    
    const red = { r: 255, g: 53, b: 53 };
    const purple = { r: 204, g: 153, b: 255 };
    const blue = { r: 153, g: 204, b: 255 };

    let r, g, b;
    
    if (value < 0.5) {
      let factor = value * 2; 
      r = Math.round(red.r + (purple.r - red.r) * factor);
      g = Math.round(red.g + (purple.g - red.g) * factor);
      b = Math.round(red.b + (purple.b - red.b) * factor);
    } else {
      let factor = (value - 0.5) * 2; 
      r = Math.round(purple.r + (blue.r - purple.r) * factor);
      g = Math.round(purple.g + (blue.g - purple.g) * factor);
      b = Math.round(purple.b + (blue.b - purple.b) * factor);
    }
    
    this.formBorderElement.nativeElement.style["border-color"] = `rgb(${r}, ${g}, ${b})`;

  }
}
