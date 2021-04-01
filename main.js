import Board from "./Board.js";
const container = document.querySelector(".board");
const board = new Board();
const rows = [];
let clicking = false;
const mouse = {
  x: null,
  y: null,
};

const nodes = [
  {
    ref: "dom",
    value: 1,
    neighbors: [],
  },
];

const handleMouseDown = (e) => {
  e.preventDefault();
  clicking = true;
};

const handleMouseUp = (e) => {
  e.preventDefault();
  clicking = false;
};

const handleMouseMove = (e) => {
  if (clicking) {
    console.log("do some");
  }
};

//init
for (let i = 0; i < board.board.length; i++) {
  const row = board.board[i];
  const cells = [];
  for (let j = 0; j < row.length; j++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.addEventListener("mousedown", handleMouseDown);
    cell.addEventListener("mouseup", handleMouseUp);
    cell.addEventListener("mousemove", handleMouseMove);
    cell.dataset.id = i * row.length + j;
    cells.push(cell);
  }
  rows.push(cells);
}

rows.forEach((row) => {
  const div = document.createElement("div");
  div.append(...row);
  container.append(div);
});

// const cells = [];

// after dom adding
// cells.map((cell) => {
//   const { x, y, width, height } = cell.getBoundingClientRect();
//   const centerX = x + width / 2;
//   const centerY = y + height / 2;
//   return {
//     cell,
//     center: {
//       x: centerX,
//       y: centerY,
//     },
//   };
// });
