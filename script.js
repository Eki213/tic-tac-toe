const createPlayer = function(name, mark) {
    const getName = () => name;
    const getMark = () => mark;

    return {getName, getMark};
};

const gameboard = (function() {
    const EMPTY_CELL = " ";
    const gameboard = Array(9).fill(EMPTY_CELL, 0);
    const WINNING_COMBINATIONS = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
                            [0, 3, 6], [1, 4, 7], [2, 5, 8],
                            [0, 4, 8], [2, 4, 6]];
    const markBoard = function(cellPosition, mark) {
        gameboard[cellPosition] = mark;
    };
    const getMark = (cellPosition) => gameboard[cellPosition];
    const isThreeInARow = function (cellPosition1, cellPosition2, cellPosition3) {
        const mark1 = getMark(cellPosition1);
        const mark2 = getMark(cellPosition2);
        const mark3 = getMark(cellPosition3);

        return (mark1 === mark2 && mark2 === mark3) && (mark1 !== EMPTY_CELL);
    };
    
    const isFilled = () => gameboard.every((mark) => mark !== EMPTY_CELL);

    const checkWinner = function() {
        const winningCombination = WINNING_COMBINATIONS.find((combination) => isThreeInARow(...combination));
        let winner = null;

        if (winningCombination) winner = getMark(winningCombination[0]);

        return winner;
    };

    const printBoard = () => console.log(` ${getMark(0)} | ${getMark(1)} | ${getMark(2)}
---+---+---
 ${getMark(3)} | ${getMark(4)} | ${getMark(5)}
---+---+---
 ${getMark(6)} | ${getMark(7)} | ${getMark(8)}`);

    const isLegal = (cellPosition) => getMark(cellPosition) === EMPTY_CELL;

    const clearBoard = () => gameboard.fill(EMPTY_CELL, 0);

    return { markBoard, checkWinner, isFilled, printBoard, isLegal, clearBoard };
})();

const game = (function () {
    let turns = 0;
    const nextTurn = () => turns++;
    const players = [createPlayer("Player1", "X"), createPlayer("Player2", "O")];
    const getCurrentPlayer = () => players[turns % 2];
    let winnerMark;
    let isTie;

    const endGame = function() { 
        winnerMark = gameboard.checkWinner();
        isTie = gameboard.isFilled();

        return winnerMark !== null || isTie;
    };
  
    const getSelectedCell = function() {
        while (true) {
            const cell = prompt("Cell number (0-8)");
            if (gameboard.isLegal(cell)) return cell;
        }
    }

    const playTurn = function () {
        const currentPlayer = getCurrentPlayer();
        const mark = currentPlayer.getMark();
        const cell = getSelectedCell();
        gameboard.markBoard(cell, mark);
    };
    
    const getWinner = () => players.find((player) => player.getMark() === winnerMark);

    const announceResult = function() {
        if (!isTie) {
            const winner = getWinner();
            console.log(`The winner is ${winner.getName()} with mark ${winnerMark}.`);
        } else {
            console.log("It's a tie.");
        }
    };

    const resetGame = function() {
        gameboard.clearBoard();
        turns = 0;
    }

    const init = function() {
        while (!endGame()) {
            playTurn();
            gameboard.printBoard();
            nextTurn();
        }
        announceResult();
        resetGame();
    };
    return { init };
})();