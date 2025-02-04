
document.addEventListener("DOMContentLoaded", function () {
    const gameUpdater = document.getElementById("gameUpdater");
    const boardContainer = document.getElementById("boardContainer");
    const gameData = JSON.parse(localStorage.getItem("penteGameData")) || {};
    
    let currentPlayer = "white";
    let ai = (gameData.gameMode === "PvAI");

    let boardState = [];
    for (let i = 0; i < 19; i++) {
        boardState[i] = new Array(19).fill(null);
    }

    let whiteCapturePairs = 0;
    let blackCapturePairs = 0;

    let gameOver = false;

 
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

        
        if (countDirection(1, 0) >= 5) return true;  // horizontal
        if (countDirection(0, 1) >= 5) return true;  // vertical
        if (countDirection(1, 1) >= 5) return true;  // diag 
        if (countDirection(1, -1) >= 5) return true; // diag 

        return false;
    }

    // capturing logic

    function checkCaptures(x, y, color) {
        
        const opponent = (color === "white") ? "black" : "white";

    
        const directions = [
            [1, 0], [-1, 0],   // horizontal
            [0, 1],  [0, -1],  // vertical
            [1, 1],  [-1, -1], // diagonal 
            [1, -1], [-1, 1],  // diagonal 
        ];

        let capturedPairCount = 0;

        for (let [dx, dy] of directions) {
         
    
            let x1 = x + dx;
            let y1 = y + dy;
            let x2 = x + 2*dx;
            let y2 = y + 2*dy;
            let x3 = x + 3*dx;
            let y3 = y + 3*dy;

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

    //end game
    function endGame(winningColor) {
        gameOver = true;
        const winnerName = (winningColor === "white") ? gameData.p1 : gameData.p2;
        let countdown = 5; //wait 5 seconds before restarting
        
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
            let cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);

            if (
                cell &&
                !cell.style.backgroundImage.includes("white.png") &&
                !cell.style.backgroundImage.includes("black.png")
            ) {
                placeStone(x, y, cell);
                success = true;
                console.log(`AI placed stone at (${x}, ${y})`);
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

        // star points
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

    // Board creation 

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
        console.log("Board created.");
    }

 
    // placeStone logic 
 
    function placeStone(x, y, cell) {
        
        if (gameOver) return;

        if (!cell) {
            console.error("Clicked cell not found.");
            return;
        }
        if (
            cell.style.backgroundImage.includes("white.png") ||
            cell.style.backgroundImage.includes("black.png")
        ) {
            console.warn("Cell already has stone.");
            return;
        }

        // Place stone visually
        cell.style.backgroundImage = `url('images/${currentPlayer}.png')`;
        console.log(`Placed ${currentPlayer} stone at (${x}, ${y})`);

       //internal
        boardState[x][y] = currentPlayer;

        //captures
        const newCaptures = checkCaptures(x, y, currentPlayer);
        if (newCaptures > 0) {
            if (currentPlayer === "white") {
                whiteCapturePairs += newCaptures;
             
                if (whiteCapturePairs >= 5) {
                    endGame("white");
                    return;
                }
            } else {
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

       //switch
        currentPlayer = (currentPlayer === "white") ? "black" : "white";
        updateTurnMessage();

        if (ai && currentPlayer === "black") {
            aiMove();
        }
    }

   
    // Setup and resize board

    function setupGameplay() {
        createBoard();
        updateTurnMessage();
        console.log("Set up.");
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

