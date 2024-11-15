

RED_DISC = "‎ ‎ ‎ ‎🔴 ‎ ‎ ‎ ‎ ‎ "
YELLOW_DISC = "‎ ‎ ‎ ‎🟡 ‎ ‎ ‎ ‎ ‎ "
WHITE_DISC = "‎ ‎ ‎ ‎⚪ ‎ ‎ ‎ ‎ ‎ "
PURPLE_DISC = "‎ ‎ ‎ ‎🟣 ‎ ‎ ‎ ‎ ‎ "

RED_SQUARE = "‎ ‎ ‎ ‎🟥 ‎ ‎ ‎ ‎ ‎ "
YELLOW_SQUARE = "‎ ‎ ‎ ‎🟨 ‎ ‎ ‎ ‎ ‎ "
WHITE_SQUARE = "‎ ‎ ‎ ‎⬜ ‎ ‎ ‎ ‎ ‎ "
PURPLE_SQUARE = "‎ ‎ ‎ ‎🟪 ‎ ‎ ‎ ‎ ‎ "

PREVIOUS_PLAY = "‎ ‎ ‎ ‎🔽 ‎ ‎ ‎ ‎ ‎ "
EMPTY_PLAY = "‎ ‎ ‎ ‎▪️ ‎ ‎ ‎ ‎ ‎ "

class Player {
    constructor(user) {
      this.user = user;
      this.color = null;
    }
}

class Game {
    constructor(player1, player2) {
      this.board = this.createBoard(); 
      player1.color = YELLOW_SQUARE;
      player2.color = RED_SQUARE;
      this.previousPlayer = PREVIOUS_PLAY;
      this.emptyPlay = EMPTY_PLAY;
      this.players = [player1, player2]; 
      this.currentPlayerIndex = Math.floor(Math.random() * 2); 
      this.lastMove = null;
      this.winner = null;
      this.lastPlayer = null;
      this.winningPositions = [];
    }
  
    createBoard() {
      return Array(6).fill().map(() => Array(7).fill(WHITE_SQUARE));
    }
  
    displayBoard() {
      let display = '';
  
      for (let col = 0; col < this.board[0].length; col++) {
          if (col === this.lastMove) {
              display += PREVIOUS_PLAY;
          } else {
              display += EMPTY_PLAY;
          }
      }
      display += '\n\n';
  
      display += this.board.map(row => row.join(' ')).join('\n\n');

      return display;
    }

    switchPlayer() {
      this.currentPlayerIndex = 1 - this.currentPlayerIndex; 
    }
  
    getCurrentPlayer() {
      return this.players[this.currentPlayerIndex];
    }
  
    placeDisc(col, color) {
      for (let row = this.board.length - 1; row >= 0; row--) {
          if (this.board[row][col] === WHITE_SQUARE) {
              this.board[row][col] = color;
              this.lastPlayer = this.getCurrentPlayer();
              this.lastMove = col;
              return true;
          }
      }
      return false;
  }

    undoMove(col) {
      for (let row = 0; row < this.board.length; row++) {
          if (this.board[row][col] !== WHITE_SQUARE) {
              this.board[row][col] = WHITE_SQUARE;
              break;
          }
      }
  }
  
  isValidMove(col) {
      return this.board[0][col] === WHITE_SQUARE;
  }
  
  isFull() {
      return this.board.every(row => row.every(cell => cell !== WHITE_SQUARE));
  }

  isTerminalNode() {
    return this.isFull() || this.checkWin(this.players[0].color, true) || this.checkWin(this.players[1].color, true);
  }

  colorWinningPieces() {
    for (const pos of this.winningPositions) {
        this.board[pos.row][pos.col] = PURPLE_SQUARE;
    }
  }

  // Vérification des lignes
  checkHorizontal(isSimulation = false) {
      for (let row = 0; row < this.board.length; row++) {
        for (let col = 0; col < this.board[row].length - 3; col++) {
          if (this.board[row][col] !== WHITE_SQUARE &&
              this.board[row][col] === this.board[row][col + 1] &&
              this.board[row][col] === this.board[row][col + 2] &&
              this.board[row][col] === this.board[row][col + 3]) {
                this.winningPositions = [
                  { row, col },
                  { row, col: col + 1 },
                  { row, col: col + 2 },
                  { row, col: col + 3 }
                ];
                if (!isSimulation) {
                  this.winner = this.getCurrentPlayer();
                  this.colorWinningPieces();
                }
              return true;
          }
        }
      }
      return false;
  }
  
  // Vérification des colonnes
  checkVertical(isSimulation = false) {
      for (let col = 0; col < this.board[0].length; col++) {
        for (let row = 0; row < this.board.length - 3; row++) {
          if (this.board[row][col] !== WHITE_SQUARE &&
              this.board[row][col] === this.board[row + 1][col] &&
              this.board[row][col] === this.board[row + 2][col] &&
              this.board[row][col] === this.board[row + 3][col]) {
                this.winningPositions = [
                  { row, col },
                  { row: row + 1, col },
                  { row: row + 2, col },
                  { row: row + 3, col }
              ];
              if (!isSimulation) {
                this.winner = this.getCurrentPlayer();
                this.colorWinningPieces();
              }
              return true;
          }
        }
      }
      return false;
  }
  
  // Vérification des diagonales
  checkDiagonal(isSimulation = false) {
      // Diagonales vers la droite
      for (let row = 0; row < this.board.length - 3; row++) {
      for (let col = 0; col < this.board[row].length - 3; col++) {
          if (this.board[row][col] !== WHITE_SQUARE &&
              this.board[row][col] === this.board[row + 1][col + 1] &&
              this.board[row][col] === this.board[row + 2][col + 2] &&
              this.board[row][col] === this.board[row + 3][col + 3]) {
                this.winningPositions = [
                  { row, col },
                  { row: row + 1, col: col + 1 },
                  { row: row + 2, col: col + 2 },
                  { row: row + 3, col: col + 3 }
              ];
              if (!isSimulation) {
                this.winner = this.getCurrentPlayer();
                this.colorWinningPieces();
              return true;
              }
          }
      }
      }
  
      // Diagonales vers la gauche
      for (let row = 0; row < this.board.length - 3; row++) {
      for (let col = 3; col < this.board[row].length; col++) {
          if (this.board[row][col] !== WHITE_SQUARE &&
              this.board[row][col] === this.board[row + 1][col - 1] &&
              this.board[row][col] === this.board[row + 2][col - 2] &&
              this.board[row][col] === this.board[row + 3][col - 3]) {
                this.winningPositions = [
                  { row, col },
                  { row: row + 1, col: col - 1 },
                  { row: row + 2, col: col - 2 },
                  { row: row + 3, col: col - 3 }
              ];
              if (!isSimulation) {
                this.winner = this.getCurrentPlayer();
                this.colorWinningPieces();
              }
              return true;
          }
      }
      }
  
      return false;
  }

  checkWin(isSimulation = false) {
    return this.checkHorizontal(isSimulation) || this.checkVertical(isSimulation) || this.checkDiagonal(isSimulation);
  }

  evaluateBoard() {
    let score = 0;

    // horizontal evaluation
    for (let row = 0; row < this.board.length; row++) {
        for (let col = 0; col < this.board[0].length - 3; col++) {
            const window = [this.board[row][col], this.board[row][col + 1], this.board[row][col + 2], this.board[row][col + 3]];
            score += this.evaluateWindow(window, this.players[1].color); 
            score -= this.evaluateWindow(window, this.players[0].color) 
        }
    }

    // vertical evaluation
    for (let col = 0; col < this.board[0].length; col++) {
        for (let row = 0; row < this.board.length - 3; row++) {
            const window = [this.board[row][col], this.board[row + 1][col], this.board[row + 2][col], this.board[row + 3][col]];
            score += this.evaluateWindow(window, this.players[1].color);
            score -= this.evaluateWindow(window, this.players[0].color); 
        }
    }

    // diagonal evaluation (bottom-left to top-right)
    for (let row = 0; row < this.board.length - 3; row++) {
        for (let col = 0; col < this.board[0].length - 3; col++) {
            const window = [this.board[row][col], this.board[row + 1][col + 1], this.board[row + 2][col + 2], this.board[row + 3][col + 3]];
            score += this.evaluateWindow(window, this.players[1].color);
            score -= this.evaluateWindow(window, this.players[0].color); 
        }
    }

    // diagonal evaluation (top-left to bottom-right)
    for (let row = 3; row < this.board.length; row++) {
        for (let col = 0; col < this.board[0].length - 3; col++) {
            const window = [this.board[row][col], this.board[row - 1][col + 1], this.board[row - 2][col + 2], this.board[row - 3][col + 3]];
            score += this.evaluateWindow(window, this.players[1].color); 
            score -= this.evaluateWindow(window, this.players[0].color); 
        }
    }

    return score;
}

evaluateWindow(window, piece) {
  let score = 0;

  const oppPiece = (piece === this.players[0].color) ? this.players[1].color : this.players[0].color;
  
  const pieceCount = window.filter(cell => cell === piece).length;
  const oppPieceCount = window.filter(cell => cell === oppPiece).length;
  const emptyCount = window.filter(cell => cell === WHITE_SQUARE).length;
  
  if (pieceCount === 4) {
      score += 100;  
  } else if (pieceCount === 3 && emptyCount === 1) {
      score += 10; 
  } else if (pieceCount === 2 && emptyCount === 2) {
      score += 5; 
  }

  if (oppPieceCount === 4) {
    score -= 150; 
  } else if (oppPieceCount === 3 && emptyCount === 1) {
      score -= 20; 
  } else if (oppPieceCount === 2 && emptyCount === 2) {
      score -= 10; 
  }

  return score;
}

  // Minimax algorithm with alpha-beta pruning
  minimax(depth, isMaximizing, alpha, beta) {

    if (depth === 0 || this.isTerminalNode()) {
        return this.evaluateBoard();
    }

    if (isMaximizing) {
        let best = -Infinity;
        for (let col = 0; col < 7; col++) {
            if (this.isValidMove(col)) {
                this.placeDisc(col, this.players[1].color);
                const value = this.minimax(depth - 1, false, alpha, beta);
                best = Math.max(best, value);
                alpha = Math.max(alpha, best);
                this.undoMove(col); 
                if (beta <= alpha) break; 
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let col = 0; col < 7; col++) {
            if (this.isValidMove(col)) {
                this.placeDisc(col, this.players[0].color);
                const value = this.minimax(depth - 1, true, alpha, beta);
                best = Math.min(best, value);
                beta = Math.min(beta, best);
                this.undoMove(col); 
                if (beta <= alpha) break;
            }
        }
        return best;
    }
  }

  findBestMove() {
    let columnScores = {};

    let bestMove = -1;
    let bestValue = -Infinity;
    for (let col = 0; col < 7; col++) {
        if (this.isValidMove(col)) {
            this.placeDisc(col, this.players[1].color);
            const moveValue = this.minimax(5, false, -Infinity, Infinity);
            columnScores[col] = moveValue;
            this.undoMove(col);
            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = col; 
            }
        } else {
          columnScores[col] = -Infinity;
        }
    }
    return bestMove;
  }
}

  module.exports = {
    Player,
    Game
  };