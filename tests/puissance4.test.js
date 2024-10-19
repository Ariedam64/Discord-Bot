const { Game } = require('../utils/puissance4.js');

describe('evaluateWindow', () => {

  const playerColor = "‎ ‎ ‎ ‎ ‎🟥 ‎ ‎ ‎ ‎ ‎ "
  const oppColor = "‎ ‎ ‎ ‎ ‎🟨 ‎ ‎ ‎ ‎ ‎ "
  const WHITE_SQUARE = "‎ ‎ ‎ ‎ ‎⬜ ‎ ‎ ‎ ‎ ‎ "

  const game = new Game({ color: playerColor }, { color: oppColor });

  it('should return 100 for four in a row', () => {
    const window = [playerColor, playerColor, playerColor, playerColor];
    const score = game.evaluateWindow(window, playerColor);
    expect(score).toBe(100);
  });

  it('should return 10 for three in a row with one empty', () => {
    const window = [playerColor, playerColor, playerColor, WHITE_SQUARE];
    const score = game.evaluateWindow(window, playerColor);
    expect(score).toBe(10);
  });

  it('should return 5 for two in a row with two empty', () => {
    const window = [playerColor, playerColor, WHITE_SQUARE, WHITE_SQUARE];
    const score = game.evaluateWindow(window, playerColor);
    expect(score).toBe(5);
  });

  it('should return -20 for blocking opponent three in a row with one empty', () => {
    const window = [oppColor, oppColor, oppColor, WHITE_SQUARE];
    const score = game.evaluateWindow(window, playerColor);
    expect(score).toBe(-20);
  });

  it('should return -10 for blocking opponent two in a row with two empty', () => {
    const window = [oppColor, oppColor, WHITE_SQUARE, WHITE_SQUARE];
    const score = game.evaluateWindow(window, playerColor);
    expect(score).toBe(-10);
  });
});

describe('evaluateWindow with full board', () => {

    const RED_SQUARE = "‎ ‎ ‎ ‎ ‎🟥 ‎ ‎ ‎ ‎ ‎ "
    const YELLOW_SQUARE = "‎ ‎ ‎ ‎ ‎🟨 ‎ ‎ ‎ ‎ ‎ "
    const WHITE_SQUARE = "‎ ‎ ‎ ‎ ‎⬜ ‎ ‎ ‎ ‎ ‎ "
  
    const board = [
      [WHITE_SQUARE, WHITE_SQUARE, YELLOW_SQUARE, YELLOW_SQUARE, WHITE_SQUARE, WHITE_SQUARE, WHITE_SQUARE],
      [WHITE_SQUARE, WHITE_SQUARE, RED_SQUARE, RED_SQUARE, WHITE_SQUARE, WHITE_SQUARE, WHITE_SQUARE],
      [WHITE_SQUARE, RED_SQUARE, RED_SQUARE, YELLOW_SQUARE, WHITE_SQUARE, WHITE_SQUARE, WHITE_SQUARE],
      [WHITE_SQUARE, YELLOW_SQUARE, YELLOW_SQUARE, YELLOW_SQUARE, WHITE_SQUARE, WHITE_SQUARE, WHITE_SQUARE],
      [WHITE_SQUARE, RED_SQUARE, RED_SQUARE, YELLOW_SQUARE, WHITE_SQUARE, WHITE_SQUARE, WHITE_SQUARE],
      [WHITE_SQUARE, RED_SQUARE, YELLOW_SQUARE, RED_SQUARE, WHITE_SQUARE, WHITE_SQUARE, WHITE_SQUARE]
    ];
  
    const game = new Game({ color: RED_SQUARE }, { color: YELLOW_SQUARE });
    game.board = board;
  
    it('should evaluate column scores correctly', () => {
        console.log("Initial board state:");
        board.forEach(row => console.log(row.join(' ')));
    
        for (let col = 0; col < board[0].length; col++) {
          let columnScore = 0;
          console.log(`\nEvaluating column ${col}:`);
    
          for (let row = 0; row < board.length - 3; row++) {
            const window = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
            console.log(`Window: ${window.join(' ')}`);
    
            const scoreForRed = game.evaluateWindow(window, RED_SQUARE);
            const scoreForYellow = game.evaluateWindow(window, YELLOW_SQUARE);
            columnScore += scoreForRed;
            columnScore -= scoreForYellow;
    
            console.log(`Score for RED_SQUARE: ${scoreForRed}, Score for YELLOW_SQUARE: ${scoreForYellow}`);
          }
    
          console.log(`Column ${col} score: ${columnScore}`);
        }
      });
    });