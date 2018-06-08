"use strict";

window.addEventListener("load", function() {
    // Create the board.
    let board = new Board();

    // Add a blinker.
    board.toggle(10, 10);
    board.toggle(11, 10);
    board.toggle(12, 10);

    // Draw the board to the canvas.
    let canvas = document.getElementById("board");
    let grid = new Grid(board, canvas);
    window.setInterval(() => {
        board.step();
        grid.draw();
    }, 1000);
});
