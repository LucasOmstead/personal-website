import { Inject, Injectable } from '@angular/core';

export type PastMoves = [number[], number[]];

export class Player {
  score: number;
  name: string;
  constructor() {
    this.name = "";
    this.score = 0;
  }
  get_action(past_moves: PastMoves, i: number): number {
      return 0;
  }
}

export class Defector extends Player {
  
  constructor() {
    super();
    this.name = "Always Defect";
  }
  override get_action(past_moves: PastMoves, i: number): number {
    return 1;
  }
}

export class Cooperator extends Player {
  
  constructor() {
    super();
    this.name = "Always Cooperate";
  }
  override get_action(past_moves: PastMoves, i: number): number {
    return 0;
  }
}

export class GrimTrigger extends Player {
  
  constructor() {
    super();
    this.name = "Grim Trigger";
  }
  override get_action(past_moves: PastMoves, i: number): number {
    return past_moves[1].includes(1) ? 1 : 0;
  }
}

export class RandomChooser extends Player {
  
  constructor() {
    super();
    this.name = "Random Chooser";
  }
  override get_action(past_moves: PastMoves, i: number): number {
    return Math.random() < 0.5 ? 0 : 1;
  }
}

export class TitForTat extends Player {
  
  constructor() {
    super();
    this.name = "Tit For Tat";
  }
  override get_action(past_moves: PastMoves, i: number): number {
    if (i === 0) return 0;
    return past_moves[1][i - 1];
  }
}

export class TwoTitForTat extends Player {
  
  constructor() {
    super();
    this.name = "Two Tit For Tat";
  }
  override get_action(past_moves: PastMoves, i: number): number {
    if (i < 2) return 0;
    return (past_moves[1][i - 1] === 1 && past_moves[1][i - 2] === 1) ? 1 : 0;
  }
}

export class NiceTitForTat extends Player {
  
  constructor() {
    super();
    this.name = "Nice Tit For Tat";
  }
  override get_action(past_moves: PastMoves, i: number): number {
    if (i === 0 || (past_moves[1].filter(x => x === 1).length / i < 0.2)) {
      return 0;
    }
    return 1;
  }
}

export class SuspiciousTitForTat extends Player {
  
  constructor() {
    super();
    this.name = "Suspicious Tit For Tat";
  }
  override get_action(past_moves: PastMoves, i: number): number {
    if (i === 0) return 1;
    return past_moves[1][i - 1];
  }
}

export class ModelPlayer extends Player {
  model: bigint;
  
  constructor(model: bigint) {
    super();
    this.name = "Sim Jim";
    this.model = model;
  }

  get_model_move(past_moves: PastMoves, i: number): number {
    if (i < 3) {
      if (i === 0) {
        return Number((this.model >> 148n) & 1n);
      }
      if (i === 1) {
        const encoding = (past_moves[0][0] << 1) + past_moves[1][0];
        return Number(((this.model >> 144n) >> BigInt(encoding)) & 1n);
      }
      if (i === 2) {
        const encoding =
          (past_moves[0][i - 1] << 3) +
          (past_moves[0][i - 2] << 2) +
          (past_moves[1][i - 1] << 1) +
          past_moves[1][i - 2];
        return Number(((this.model >> 128n) >> BigInt(encoding)) & 1n);
      }
    } else {
      const encoding =
        ((past_moves[1].includes(1) ? 1 : 0) << 6) +
        (past_moves[0][i - 1] << 5) +
        (past_moves[0][i - 2] << 4) +
        (past_moves[0][i - 3] << 3) +
        (past_moves[1][i - 1] << 2) +
        (past_moves[1][i - 2] << 1) +
        past_moves[1][i - 3];
      return Number((this.model >> BigInt(encoding)) & 1n);
    }
    return 0;
  }
  
  override get_action(past_moves: PastMoves, i: number): number {
    return this.get_model_move(past_moves, i);
  }
}

export class You extends Player {
  constructor() {
    super();
    this.name = "You";
  }
  override get_action(past_moves: PastMoves, i: number): number {
    return 0;
  }
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {

  constructor() {}
  //So what do we want to be able to do?
  //Play each game
  //Get results of each game
  //

}
