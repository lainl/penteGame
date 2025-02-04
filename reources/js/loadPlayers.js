document.addEventListener("DOMContentLoaded", function () {
    const storedData = localStorage.getItem("penteGameData");
    console.log("Retrieved raw data:", storedData);

    const gameData = storedData ? JSON.parse(storedData) : {};
    console.log("Parsed game data:", gameData);

    document.getElementById("playerOne").textContent = "Player 1: " + (gameData.p1 || "Unknown");
    document.getElementById("playerTwo").textContent = "Player 2: " + (gameData.p2 || "Unknown");

});
