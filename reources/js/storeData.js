document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("gameSetup");
    const playerTwoInput = document.getElementById("playerTwoInput");
    const playerTwoField = document.getElementById("playerTwo");
    
    // Show or hide Player 2 input based on radio 
    document.getElementById("modePvP").addEventListener("change", function () {
        playerTwoInput.style.display = "block";
        playerTwoField.setAttribute("required", "required");
    });

    document.getElementById("modePvAI").addEventListener("change", function () {
        playerTwoInput.style.display = "none";
        playerTwoField.removeAttribute("required");
    });

    // finally store the data
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const playerOne = document.getElementById("playerOne").value.trim();
        const gameMode = document.querySelector("input[name='gameMode']:checked").value;
        const playerTwo = gameMode === "PvP" ? playerTwoField.value.trim() : "AI";

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
