document.addEventListener("DOMContentLoaded", () => {
    const landingPage = document.getElementById("landing-page");
    const gamePage = document.getElementById("game-page");
    const playerForm = document.getElementById("player-form");
    const gameBoard = document.getElementById("game-board");
    const gameStatus = document.getElementById("game-status");
    const restartBtn = document.getElementById("restart-btn");
    const winSound = document.getElementById("win-sound");
    const clickSound = document.getElementById("click-sound");
    const modeSelect = document.getElementById("mode");

    let player1Name = "Player 1";
    let player2Name = "Player 2";
    let currentPlayer = "X";  // "X" starts first
    let boardState = Array(9).fill(null);
    let gameActive = true;
    let winningCells = [];
    let gameMode = "player-vs-player"; // Default to Player vs Player

    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    playerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        player1Name = document.getElementById("player1-name").value || "Player 1";
        player2Name = document.getElementById("player2-name").value || "Player 2";
        gameMode = modeSelect.value;
        landingPage.classList.add("hidden");
        gamePage.classList.remove("hidden");
        initializeBoard();
    });

    const initializeBoard = () => {
        gameBoard.innerHTML = "";
        boardState.fill(null);
        gameActive = true;
        currentPlayer = "X";
        winningCells = [];
        gameStatus.textContent = `${player1Name}'s Turn (X)`;
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.index = i;
            cell.addEventListener("click", handleCellClick);
            gameBoard.appendChild(cell);
        }
    };

    const handleCellClick = (e) => {
        if (!gameActive) return;
        const cell = e.target;
        const index = cell.dataset.index;

        if (boardState[index]) return;

        clickSound.play();
        boardState[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add("taken");

        if (checkWinner()) {
            gameStatus.textContent = `${currentPlayer === "X" ? player1Name : player2Name} Wins!`;
            winSound.play();
            highlightWinner();
            gameActive = false;
        } else if (boardState.every((cell) => cell)) {
            gameStatus.textContent = "It's a Draw!";
            gameActive = false;
        } else {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            gameStatus.textContent = `${currentPlayer === "X" ? player1Name : player2Name}'s Turn (${currentPlayer})`;

            // If it's the computer's turn (in Player vs Computer mode)
            if (gameMode === "player-vs-computer" && currentPlayer === "O" && gameActive) {
                setTimeout(aiTurn, 500);
            }
        }
    };

    const aiTurn = () => {
        const bestMove = minimax(boardState, "O");
        const cell = gameBoard.children[bestMove.index];
        boardState[bestMove.index] = "O";
        cell.textContent = "O";
        cell.classList.add("taken");

        if (checkWinner()) {
            gameStatus.textContent = `${player2Name} Wins!`;
            winSound.play();
            highlightWinner();
            gameActive = false;
        } else if (boardState.every((cell) => cell)) {
            gameStatus.textContent = "It's a Draw!";
            gameActive = false;
        } else {
            currentPlayer = "X";
            gameStatus.textContent = `${player1Name}'s Turn (X)`;
        }
    };

    const minimax = (board, player) => {
        const availableMoves = board
            .map((cell, index) => cell === null ? index : null)
            .filter(index => index !== null);

        // Check for win or draw scenarios
        if (checkWinner(board)) {
            return { score: player === "O" ? 1 : -1 };  // AI wins = 1, Player wins = -1
        } else if (availableMoves.length === 0) {
            return { score: 0 };  // Draw
        }

        const moves = [];
        availableMoves.forEach((move) => {
            const newBoard = [...board];
            newBoard[move] = player;

            const result = minimax(newBoard, player === "O" ? "X" : "O");  // Switch player

            moves.push({ index: move, score: result.score });
        });

        if (player === "O") {  // AI (O) is trying to maximize score
            return moves.reduce((bestMove, move) => (move.score > bestMove.score ? move : bestMove), { score: -Infinity });
        } else {  // Player (X) is trying to minimize score
            return moves.reduce((bestMove, move) => (move.score < bestMove.score ? move : bestMove), { score: Infinity });
        }
    };

    const checkWinner = (board = boardState) => {
        return winConditions.some((condition) => {
            const [a, b, c] = condition;
            if (
                board[a] &&
                board[a] === board[b] &&
                board[a] === board[c]
            ) {
                winningCells = [a, b, c]; // Save the winning cells for animation
                return true;
            }
            return false;
        });
    };

    const highlightWinner = () => {
        // Highlight the winning cells with a glowing effect
        winningCells.forEach(index => {
            const cell = gameBoard.children[index];
            cell.classList.add("winner");
        });
    };

    restartBtn.addEventListener("click", initializeBoard);
});
