document.addEventListener("DOMContentLoaded", function () {
    const gameUpdater = document.getElementById("gameUpdater");
    const boardContainer = document.getElementById("boardContainer");
    const gameData = JSON.parse(localStorage.getItem("penteGameData")) || {};
    
    let currentPlayer = "white";
    let ai = gameData.gameMode === "PvAI";

    function updateTurnMessage() {
        const currentPlayerName = currentPlayer === "white" ? gameData.p1 : gameData.p2;
        gameUpdater.textContent = `Current Turn: ${currentPlayerName} (${currentPlayer})`;
    }
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    function aiMove() {
        let success = false;
        while (!success) {
            let x = getRandomInt(19);
            let y = getRandomInt(19);
            let cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);

            if (cell && !cell.style.backgroundImage.includes("white.png") && !cell.style.backgroundImage.includes("black.png")) {
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
        
    
        if ((x === 9 && y === 9) || (x === 3 && y === 3) || (x === 3 && y === 15) ||
            (x === 15 && y === 3) || (x === 15 && y === 15) || (x === 9 && y === 3) ||
            (x === 9 && y === 15) || (x === 3 && y === 9) || (x === 15 && y === 9)) {
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
        console.log("Board created.");
    }
    function placeStone(x, y, cell) {
        if (!cell) {
            console.error("Clicked cell not found.");
            return;
        }
        if (cell.style.backgroundImage.includes("white.png") || cell.style.backgroundImage.includes("black.png")) {
            console.warn("Cell already has stone.");
            return;
        }

        cell.style.backgroundImage = `url('images/${currentPlayer}.png')`;
        console.log(`Placed ${currentPlayer} stone at (${x}, ${y})`);

        currentPlayer = currentPlayer === "white" ? "black" : "white";
        updateTurnMessage();

        if (ai && currentPlayer === "black") {
            aiMove();
        }
    }

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
})