document.addEventListener("DOMContentLoaded", function () {
    const gameUpdater = document.getElementById("gameUpdater");
    const boardContainer = document.getElementById("boardContainer");
    const gameData = JSON.parse(localStorage.getItem("penteGameData")) || {};

    const p1TxtBox = document.getElementById("playerOne");
   
    const p2TxtBox = document.getElementById("playerTwo");

    let currentPlayer = "white";
    let ai = (gameData.gameMode === "PvAI");
    let boardState = [];
    for (let i = 0; i < 19; i++) {
        boardState[i] = new Array(19).fill(null);
    }
    let whiteCapturePairs = 0;
    let blackCapturePairs = 0;
    let gameOver = false;
    let whiteMoveCount = 0;

    function updateTurnMessage() {
        const currentPlayerName = currentPlayer === "white" ? gameData.p1 : gameData.p2;
        gameUpdater.textContent = `Current Turn: ${currentPlayerName} (${currentPlayer})`;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function checkForWinner(x, y) {
        const color = boardState[x][y];
        if (!color) return false;

        function countDirection(dx, dy) {
            let count = 1;
            let nx = x + dx;
            let ny = y + dy;
            while (nx >= 0 && nx < 19 && ny >= 0 && ny < 19 && boardState[nx][ny] === color) {
                count++;
                nx += dx;
                ny += dy;
            }
            nx = x - dx;
            ny = y - dy;
            while (nx >= 0 && nx < 19 && ny >= 0 && ny < 19 && boardState[nx][ny] === color) {
                count++;
                nx -= dx;
                ny -= dy;
            }
            return count;
        }

        if (countDirection(1, 0) >= 5) return true;
        if (countDirection(0, 1) >= 5) return true;
        if (countDirection(1, 1) >= 5) return true;
        if (countDirection(1, -1) >= 5) return true;
        return false;
    }

    function checkCaptures(x, y, color) {
        const opponent = color === "white" ? "black" : "white";
        const directions = [
            [1, 0], [-1, 0],
            [0, 1], [0, -1],
            [1, 1], [-1, -1],
            [1, -1], [-1, 1]
        ];
        let capturedPairCount = 0;

        for (let [dx, dy] of directions) {
            let x1 = x + dx;
            let y1 = y + dy;
            let x2 = x + 2 * dx;
            let y2 = y + 2 * dy;
            let x3 = x + 3 * dx;
            let y3 = y + 3 * dy;

            if (
                x1 < 0 || x1 > 18 || y1 < 0 || y1 > 18 ||
                x2 < 0 || x2 > 18 || y2 < 0 || y2 > 18 ||
                x3 < 0 || x3 > 18 || y3 < 0 || y3 > 18
            ) {
                continue;
            }

            if (
                boardState[x1][y1] === opponent &&
                boardState[x2][y2] === opponent &&
                boardState[x3][y3] === color
            ) {
                boardState[x1][y1] = null;
                boardState[x2][y2] = null;

                const cell1 = document.querySelector(`.cell[data-x="${x1}"][data-y="${y1}"]`);
                const cell2 = document.querySelector(`.cell[data-x="${x2}"][data-y="${y2}"]`);
                if (cell1) {
                    cell1.style.backgroundImage = `url('images/${getBackground(x1, y1)}')`;
                }
                if (cell2) {
                    cell2.style.backgroundImage = `url('images/${getBackground(x2, y2)}')`;
                }
                capturedPairCount += 1;
            }
        }
        return capturedPairCount;
    }

    function endGame(winningColor) {
        gameOver = true;
        const winnerName = (winningColor === "white") ? gameData.p1 : gameData.p2;
        let countdown = 5;
        gameUpdater.textContent = `${winnerName} (${winningColor}) wins! Returning in ${countdown}...`;

        const timer = setInterval(() => {
            countdown--;
            gameUpdater.textContent = `${winnerName} (${winningColor}) wins! Returning in ${countdown}...`;
            if (countdown <= 0) {
                clearInterval(timer);
                window.location.href = "../index.html";
            }
        }, 1000);
    }

    function aiMove() {
        if (gameOver) return;
        let success = false;
        while (!success) {
            let x = getRandomInt(19);
            let y = getRandomInt(19);
            const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
            if (
                cell &&
                !cell.style.backgroundImage.includes("white.png") &&
                !cell.style.backgroundImage.includes("black.png")
            ) {
                placeStone(x, y, cell);
                success = true;
            }
        }
    }

    function getBackground(x, y) {
        if (x === 0 && y === 0) return "tlCorner.png";
        if (x === 0 && y === 18) return "trCorner.png";
        if (x === 18 && y === 0) return "blCorner.png";
        if (x === 18 && y === 18) return "brCorner.png";
        if (x === 0) return "tEdge.png";
        if (x === 18) return "bEdge.png";
        if (y === 0) return "lEdge.png";
        if (y === 18) return "rEdge.png";
        if (
            (x === 9 && y === 9) ||
            (x === 3 && y === 3) ||
            (x === 3 && y === 15) ||
            (x === 15 && y === 3) ||
            (x === 15 && y === 15) ||
            (x === 9 && y === 3) ||
            (x === 9 && y === 15) ||
            (x === 3 && y === 9) ||
            (x === 15 && y === 9)
        ) {
            return "background-dot.png";
        }
        return "background.png";
    }

    function createBoard() {
        boardContainer.innerHTML = "";
        for (let x = 0; x < 19; x++) {
            for (let y = 0; y < 19; y++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.setAttribute("data-x", x);
                cell.setAttribute("data-y", y);
                cell.style.backgroundImage = `url('images/${getBackground(x, y)}')`;
                cell.style.backgroundSize = "cover";
                cell.addEventListener("click", function() {
                    placeStone(x, y, cell);
                });
                boardContainer.appendChild(cell);
            }
        }
    }

    function checkTriaTesera(x, y, color) {
        let foundTria = false;
        let foundTesera = false;
        const directions = [
            [1, 0], [0, 1], [1, 1], [1, -1]
        ];

        for (let [dx, dy] of directions) {
            let count = 1;
            let frontOpen = false;
            let backOpen = false;

            let nx = x + dx;
            let ny = y + dy;
            while (
                nx >= 0 && nx < 19 &&
                ny >= 0 && ny < 19 &&
                boardState[nx][ny] === color
            ) {
                count++;
                nx += dx;
                ny += dy;
            }
            if (nx >= 0 && nx < 19 && ny >= 0 && ny < 19 && boardState[nx][ny] === null) {
                frontOpen = true;
            }

            nx = x - dx;
            ny = y - dy;
            while (
                nx >= 0 && nx < 19 &&
                ny >= 0 && ny < 19 &&
                boardState[nx][ny] === color
            ) {
                count++;
                nx -= dx;
                ny -= dy;
            }
            if (nx >= 0 && nx < 19 && ny >= 0 && ny < 19 && boardState[nx][ny] === null) {
                backOpen = true;
            }

            if (count === 3 && frontOpen && backOpen) {
                foundTria = true;
            }
            if (count === 4 && (frontOpen || backOpen)) {
                foundTesera = true;
            }
        }
        return { foundTria, foundTesera };
    }

    function placeStone(x, y, cell) {
        if (gameOver) return;
        if (!cell) return;
    
        if (
            cell.style.backgroundImage.includes("white.png") ||
            cell.style.backgroundImage.includes("black.png")
        ) {
            return;
        }
    
        if (currentPlayer === "white" && whiteMoveCount === 0) {
            if (x !== 9 || y !== 9) return;
            whiteMoveCount++;
        }
    
        cell.style.backgroundImage = `url('images/${currentPlayer}.png')`;
        boardState[x][y] = currentPlayer;
    
        const patternCheck = checkTriaTesera(x, y, currentPlayer);
    
        if (patternCheck.foundTria) {
            const box = (currentPlayer === "white") ? p1TxtBox : p2TxtBox;
            if (box) {
                const triaMsg = document.createElement("div");
                triaMsg.textContent = "Tria!";
                triaMsg.style.color = "cyan";
                triaMsg.style.fontWeight = "bold";
                triaMsg.style.marginTop = "5px";
    
                triaMsg.dataset.position = `${x}-${y}`;
    

                const existingTria = box.querySelector(`[data-position='${x}-${y}']`);
                if (!existingTria) {
                    box.appendChild(triaMsg);
                    setTimeout(() => {
                        if (triaMsg.parentNode) {
                            triaMsg.parentNode.removeChild(triaMsg);
                        }
                    }, 5000);
                }
            }
        }
    
        if (patternCheck.foundTesera) {
            const box = (currentPlayer === "white") ? p1TxtBox : p2TxtBox;
            if (box) {
                const teseraMsg = document.createElement("div");
                teseraMsg.textContent = "Tesera!";
                teseraMsg.style.color = "yellow";
                teseraMsg.style.fontWeight = "bold";
                teseraMsg.style.marginTop = "5px";
                box.appendChild(teseraMsg);
    
                setTimeout(() => {
                    if (teseraMsg.parentNode) {
                        teseraMsg.parentNode.removeChild(teseraMsg);
                    }
                }, 5000);
            }
        }
    
        const newCaptures = checkCaptures(x, y, currentPlayer);
        if (newCaptures > 0) {
            if (currentPlayer === "white") {
                for (let i = 0; i < newCaptures; i++) {
                    const img = document.createElement("img");
                    img.src = "images/stolen-black.png";
                    p1TxtBox.appendChild(img);
                }
                whiteCapturePairs += newCaptures;
                if (whiteCapturePairs >= 5) {
                    endGame("white");
                    return;
                }
            } else {
                for (let i = 0; i < newCaptures; i++) {
                    const img = document.createElement("img");
                    img.src = "images/stolen-white.png";
                    p2TxtBox.appendChild(img);
                }
                blackCapturePairs += newCaptures;
                if (blackCapturePairs >= 5) {
                    endGame("black");
                    return;
                }
            }
        }
    
        if (checkForWinner(x, y)) {
            endGame(currentPlayer);
            return;
        }
    
        currentPlayer = (currentPlayer === "white") ? "black" : "white";
        updateTurnMessage();
    
        if (ai && currentPlayer === "black") {
            aiMove();
        }
    }
    

    function setupGameplay() {
        createBoard();
        updateTurnMessage();
    }

    setupGameplay();

    function resizeBoard() {
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
        boardContainer.style.width = `${size}px`;
        boardContainer.style.height = `${size}px`;
        boardContainer.style.margin = "auto";
    }

    window.addEventListener("resize", resizeBoard);
});
