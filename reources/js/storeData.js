document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("gameSetup");
    const playerTwoInput = document.getElementById("playerTwoInput");
    const playerTwoField = document.getElementById("playerTwo");

    document.getElementById("modePvP").addEventListener("change", function () {
        playerTwoInput.style.display = "block";
        playerTwoField.removeAttribute("required");
    });

    document.getElementById("modePvAI").addEventListener("change", function () {
        playerTwoInput.style.display = "none";
        playerTwoField.removeAttribute("required");
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const playerOne = document.getElementById("playerOne").value.trim() || "Player 1";
        const gameMode = document.querySelector("input[name='gameMode']:checked").value;
        const playerTwo = gameMode === "PvP" ? (playerTwoField.value.trim() || "Player 2") : "AI";

        const gameData = {
            p1: playerOne,
            gameMode: gameMode,
            p2: playerTwo,
        };

        localStorage.setItem("penteGameData", JSON.stringify(gameData));

        console.log("Game data saved:", gameData);

        window.location.href = "reources/board.html"; 
    });
});
