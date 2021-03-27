import Board from "./Board.js";
const container = document.querySelector(".board");
const board = new Board();
const rows = [];

//init
for (let i = 0; i < board.board.length; i++) {
  const row = board.board[i];
  const cells = [];
  for (let j = 0; j < row.length; j++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cells.push(cell);
  }
  rows.push(cells);
}

rows.forEach((row) => {
  const div = document.createElement("div");
  div.append(...row);
  container.append(div);
});
// document.body.append(...rows);
//build
