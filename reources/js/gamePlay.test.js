/**
 * Tests the winning condition
 * and tests the capturing
 */


let boardState;
let currentPlayer;


function resetBoard() {
    boardState = Array.from({ length: 19 }, () => Array(19).fill(null));
    currentPlayer = "white";
}


function placeStone(x, y, color) {
    boardState[x][y] = color;
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

    return (
        countDirection(1, 0) >= 5 ||  
        countDirection(0, 1) >= 5 || 
        countDirection(1, 1) >= 5 ||  
        countDirection(1, -1) >= 5    
    );
}

function checkCaptures(x, y, color) {
    const opponent = color === "white" ? "black" : "white";
    let captures = 0;
    const directions = [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [-1, -1], [1, -1], [-1, 1]
    ];

    for (let [dx, dy] of directions) {
        let x1 = x + dx;
        let y1 = y + dy;
        let x2 = x + 2 * dx;
        let y2 = y + 2 * dy;
        let x3 = x + 3 * dx;
        let y3 = y + 3 * dy;

        if (
            x3 >= 0 && x3 < 19 && y3 >= 0 && y3 < 19 &&
            boardState[x1][y1] === opponent &&
            boardState[x2][y2] === opponent &&
            boardState[x3][y3] === color
        ) {
            boardState[x1][y1] = null;
            boardState[x2][y2] = null;
            captures++;
        }
    }

    return captures;
}


describe("Pente Game Logic", () => {
    beforeEach(() => {
        resetBoard();
    });

    test("Detects a 5-in-a-row win condition horizontally", () => {
        for (let i = 0; i < 5; i++) {
            placeStone(i, 0, "white");
        }
        expect(checkForWinner(4, 0)).toBe(true);
    });

    test("Correctly captures two opponent stones", () => {
        // Seting up black stones at (2,0) and (3,0) surrounded by white stones
        placeStone(1, 0, "white");
        placeStone(2, 0, "black");
        placeStone(3, 0, "black");
        placeStone(4, 0, "white");

        const captures = checkCaptures(4, 0, "white");

        expect(captures).toBe(1);
        expect(boardState[2][0]).toBe(null);
        expect(boardState[3][0]).toBe(null);
    });
});
