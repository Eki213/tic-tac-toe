const createPlayer = function(name, mark) {
    const getName = () => name;
    const setName = (newName) => name = newName;
    const getMark = () => mark;

    return { getName, getMark, setName };
};

const gameboard = (function() {
    const EMPTY_CELL = " ";
    const gameboard = Array(9).fill(EMPTY_CELL);
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

    const checkResult = function() {
        const winningCombination = WINNING_COMBINATIONS.find((combination) => isThreeInARow(...combination));
        let result = null;

        if (winningCombination) {
            result = getMark(winningCombination[0]);
        } else if (isFilled()) {
            result = "Tie";
        }

        return result;
    };

    const printBoard = () => console.log(` ${getMark(0)} | ${getMark(1)} | ${getMark(2)}
---+---+---
 ${getMark(3)} | ${getMark(4)} | ${getMark(5)}
---+---+---
 ${getMark(6)} | ${getMark(7)} | ${getMark(8)}`);

    const isLegal = (cellPosition) => getMark(cellPosition) === EMPTY_CELL;

    const clearBoard = () => gameboard.fill(EMPTY_CELL, 0);

    return { markBoard, checkResult, printBoard, isLegal, clearBoard, getMark };
})();

const game = (function () {
    let turns = 0;
    const nextTurn = () => turns++;
    const players = [createPlayer("Player1", "X"), createPlayer("Player2", "O")];
    const getCurrentPlayer = () => players[turns % 2];
    let winnerMark = null;

    const endGame = () => winnerMark !== null;

    const playTurn = function (cell) {
        const mark = getCurrentPlayer().getMark();
        gameboard.markBoard(cell, mark);
        winnerMark = gameboard.checkResult();
        nextTurn();
    };
    
    const getWinner = () => players.find((player) => player.getMark() === winnerMark);

    const resetGame = function() {
        gameboard.clearBoard();
        winnerMark = null;
        turns = 0;
    }

    const changePlayerNames = function(names) {
        names.forEach((name, index) => { if (name) players[index].setName(name) });
    };

    return { playTurn, resetGame, endGame, getWinner, changePlayerNames, getCurrentPlayer };
})();

const displayController = (function() {
    const gameContainer = document.querySelector(".game");
    const gridContainer = document.querySelector(".board");
    const announcementsContainer = document.querySelector(".announcements");
    const introScreen = document.querySelector(".intro-screen");
    const changeNamesButton = document.querySelector("button[type='submit']");
    const gameButton = document.querySelector(".game-button");
    let gameStarted = false;

    const createGrid = function() {
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("button");
            cell.className = "cell";
            cell.setAttribute("type", "button");
            cell.dataset.index = i;
            gridContainer.appendChild(cell);
        }
    };

    const updateGrid = function() {
        const cells = document.querySelectorAll(".cell");
        cells.forEach(updateCell);
    };

    const applyMarkStyle = function(element, mark) {
        element.textContent = mark;
        element.dataset.mark = mark;
    };

    const updateTurnAnnouncement = function() {
        const currentPlayer = game.getCurrentPlayer();
        const span = document.createElement("span");
        const mark = currentPlayer.getMark();
        applyMarkStyle(span, mark);

        announcementsContainer.textContent = `${currentPlayer.getName()}'s turn (`;
        announcementsContainer.appendChild(span);
        announcementsContainer.append(")"); 
    };

    const updateCell = function (cell) { 
        const mark = gameboard.getMark(cell.dataset.index);
        applyMarkStyle(cell, mark);
    };

    const endGameHandler = function() {
        const winner = game.getWinner();
        if (winner) {
            announcementsContainer.textContent = `The winner is ${winner.getName()}!`
        } else {
            announcementsContainer.textContent = "It's a tie!";
        }
        gameButton.textContent = "Play Again";
    };

    const clickHandlerBoard = function (event) {
        const cell = event.target;
        const index = cell.dataset.index;
        if (!index || !gameboard.isLegal(index) || game.endGame() || !gameStarted) return;

        game.playTurn(index);
        updateCell(cell);
        updateTurnAnnouncement();

        if (game.endGame()) endGameHandler();
    };

    gridContainer.addEventListener("click", clickHandlerBoard);

    const gameButtonHandler = function() {
        if (!gameStarted) {
            gameStarted = true;
        } else {
            game.resetGame();
            updateGrid();
        }

        gameButton.textContent = "Restart";
        updateTurnAnnouncement();
    };

    const namesFormHandler = function(event) {
        event.preventDefault();
        const inputs = document.querySelectorAll(".intro-screen input[type='text']");
        const names = [...inputs].map((input) => input.value);
        game.changePlayerNames(names);
        
        introScreen.classList.add("hidden");
        gameContainer.classList.remove("hidden");
    };

    changeNamesButton.addEventListener("click", namesFormHandler);
    gameButton.addEventListener("click", gameButtonHandler);
    createGrid();
})();

const consoleController = (function() {
    const init = function() {
        while (!game.endGame()) {
            announceTurn();
            game.playTurn(getSelectedCell());
            gameboard.printBoard();
        }
        announceResult();
        game.resetGame();
    };

    const announceTurn = function() {
        const currentPlayer = game.getCurrentPlayer();
        console.log (`${currentPlayer.getName()}'s turn (${currentPlayer.getMark()})`);
    };

    const announceResult = function() {
        const winner = game.getWinner();
        if (winner) {
            console.log(`The winner is ${winner.getName()} with mark ${winner.getMark()}.`);
        } else {
            console.log("It's a tie.");
        }
    };

    const getSelectedCell = function() {
        while (true) {
            const cell = prompt("Enter Cell Number (0-8):");
            if (gameboard.isLegal(cell)) return cell;
        }
    }

    return { init };
})();