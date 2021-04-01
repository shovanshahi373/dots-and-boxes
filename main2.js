const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 600;

const canvasRect = canvas.getBoundingClientRect();

const gridsize = 5;
const dots = gridsize + 1;

const cellSize = canvas.width / (gridsize + 2);

const padX = canvas.width - gridsize * cellSize;
const padY = canvas.height - gridsize * cellSize;

const squares = [];
const lines = [];

class Line {
  constructor(x, y, x1, y1, player) {
    this.x = x;
    this.y = y;
    this.x1 = x1;
    this.y1 = y1;
    this.owner = player.owner;
    this.color = player.color;
  }
  draw() {
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.lineWidth = 0.8 * (20 / gridsize);
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x1, this.y1);
    ctx.stroke();
  }
  update() {
    this.draw();
  }
}

class Square {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.key = squares.length;
    this.diff = {
      top: {
        x: this.x,
        y: this.y,
        x1: this.x + cellSize,
        y1: this.y,
        owner: null,
      },
      bottom: {
        x: this.x,
        y: this.y + cellSize,
        x1: this.x + cellSize,
        y1: this.y + cellSize,
        owner: null,
      },
      left: {
        x: this.x,
        y: this.y,
        x1: this.x,
        y1: this.y + cellSize,
        owner: null,
      },
      right: {
        x: this.x + cellSize,
        y: this.y,
        x1: this.x + cellSize,
        y1: this.y + cellSize,
        owner: null,
      },
    };
    this.closest = null;
    this.room = {
      owner: null,
    };
  }
  isInside() {
    return (
      mouse.x > this.x &&
      this.x + cellSize > mouse.x &&
      mouse.y > this.y &&
      this.y + cellSize > mouse.y
    );
  }
  getClosestSide() {
    const data = { top: null, bottom: null, left: null, right: null };
    data.top = Math.abs(mouse.y - this.y);
    data.bottom = Math.abs(mouse.y - (this.y + cellSize));
    data.left = Math.abs(mouse.x - this.x);
    data.right = Math.abs(mouse.x - (this.x + cellSize));
    const closest = Object.entries(data).reduce(
      (ac, [dir, value]) => {
        if (value < ac.value) {
          ac.dir = dir;
          ac.value = value;
          return ac;
        }
        return ac;
      },
      { dir: null, value: Number.POSITIVE_INFINITY }
    );
    this.closest = closest.dir;
  }
  drawRoom() {
    ctx.fillStyle = this.room.owner.roomColor;
    ctx.fillRect(this.x, this.y, cellSize, cellSize);
    ctx.fillStyle = "white";
    ctx.save();
    ctx.translate(this.x + 0.5 * cellSize, this.y + 0.5 * cellSize);
    ctx.rotate(-45);
    ctx.font = "25px Arial";
    ctx.textAlign = "center";
    const name = this.room.owner.name;
    ctx.fillText(name, ((name.length / 2) | 0) * -1, 0.5, cellSize);
    ctx.restore();
  }
  connect(x, y, x1, y1, owner = null) {
    ctx.strokeStyle = owner?.color || players[currentPlayer].color;
    ctx.beginPath();
    ctx.lineWidth = 0.8 * (20 / gridsize);
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  update() {
    if (this.room.owner) this.drawRoom();
    if (this.isInside()) this.getClosestSide();
    else this.closest = null;
    if (this.closest) {
      const { x, y, x1, y1, owner } = this.diff[this.closest];
      if (!owner) this.connect(x, y, x1, y1);
    }
  }
}

//create dots
for (let i = 0; i < gridsize; i++) {
  for (let j = 0; j < gridsize; j++) {
    const x = cellSize * j + padX / 2;
    const y = cellSize * i + padY / 2;
    squares.push(new Square(x, y));
  }
}

const mouse = {
  x: null,
  y: null,
};

const animate = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < lines.length; i++) {
    lines[i].update();
  }
  for (let i = 0; i < squares.length; i++) {
    squares[i].update();
  }
  for (let i = 0; i < dots; i++) {
    for (let j = 0; j < dots; j++) {
      const x = cellSize * j + padX / 2;
      const y = cellSize * i + padY / 2;
      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.arc(x, y, 20 / gridsize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  requestAnimationFrame(animate);
};

animate();

canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX - canvasRect.x;
  mouse.y = e.clientY - canvasRect.y;
});

let currentPlayer = 0;

const players = [
  {
    name: "player_1",
    id: 1,
    color: "red",
    roomColor: "rgba(255,0,0,0.2)",
    score: 0,
  },
  {
    name: "player_2",
    id: 2,
    color: "blue",
    roomColor: "rgba(0,0,255,0.2)",
    score: 0,
  },
];

//enums
const EDGE = {
  LEFT: "left",
  RIGHT: "right",
  TOP: "top",
  BOTTOM: "bottom",
};

const swapTurn = () => {
  currentPlayer = (currentPlayer + 1) % players.length;
};

canvas.addEventListener("click", () => {
  if (mouse.x > padX * 0.5 && mouse.y > padY * 0.5) {
    const squareX = ((mouse.x - padX * 0.5) / cellSize) | 0;
    const squareY = ((mouse.y - padY * 0.5) / cellSize) | 0;
    const index = squareX + squareY * gridsize;
    const target = squares[index];
    console.log(index, "/", squares.length);
    if (target.closest && !target.diff[target.closest].owner) {
      const { x, y, x1, y1 } = target.diff[target.closest];
      target.diff[target.closest].owner = { ...players[currentPlayer] };
      lines.push(new Line(x, y, x1, y1, { ...players[currentPlayer] }));

      //mark the neighbor square edge too, as left edge of one square => right of another
      let siblingTarget;
      if (target.closest === EDGE.LEFT && squareX > 0) {
        siblingTarget = squares[index - 1];
        siblingTarget.diff[EDGE.RIGHT].owner = { ...players[currentPlayer] };
        console.log("marked square => ", index);
        console.log("neighbor square => ", index - 1);
      } else if (target.closest === EDGE.RIGHT && squareX < gridsize - 1) {
        siblingTarget = squares[index + 1];
        siblingTarget.diff[EDGE.LEFT].owner = { ...players[currentPlayer] };
        console.log("marked square => ", index);
        console.log("neighbor square => ", index + 1);
      } else if (target.closest === EDGE.TOP && squareY > 0) {
        siblingTarget = squares[index - gridsize];
        siblingTarget.diff[EDGE.BOTTOM].owner = { ...players[currentPlayer] };
        console.log("marked square => ", index);
        console.log("neighbor square => ", index - gridsize - 1);
      } else if (target.closest === EDGE.BOTTOM && squareY < gridsize - 1) {
        siblingTarget = squares[index + gridsize];
        siblingTarget.diff[EDGE.TOP].owner = { ...players[currentPlayer] };
        console.log("marked square => ", index);
        console.log("neighbor square => ", index + gridsize - 1);
      } else {
        console.log("no neighbor marked!");
      }
      const madeRoom = shouldCreateRoom(index);
      if (madeRoom) {
        checkNeighbors(target, squareX, squareY);
      } else {
        swapTurn();
      }
    }
  }
});

const shouldCreateRoom = (index) => {
  if (squares[index].room.owner !== null) return false;
  //check self
  const target = squares[index];
  const count = Object.entries(target.diff).reduce((ac, [key, { owner }]) => {
    if (owner) return ++ac;
    return ac;
  }, 0);
  if (count === 4) {
    players[currentPlayer].score++;
    squares[index].room.owner = players[currentPlayer];
    return true;
  }
  return false;
};

const getRemainingSide = (square) => {
  const sides = Object.entries(square.diff).reduce(
    (sides, [side, { owner }]) => {
      if (owner) {
        sides.push(side);
        return sides;
      }
      return sides;
    },
    []
  );
  if (sides.length === 3) {
    return Object.values(EDGE)
      .filter((side) => sides.every((s) => s !== side))
      .pop();
  }
  return false;
};

const checkNeighbors = (target, row, col, memo = []) => {
  if (memo[target.key]) return;
  const registerRoom = (currentTarget, edge) => {
    currentTarget.diff[edge].owner = players[currentPlayer];
    const { x, y, x1, y1 } = currentTarget.diff[edge];
    lines.push(new Line(x, y, x1, y1, { ...players[currentPlayer] }));
    currentTarget.room.owner = players[currentPlayer];
    players[currentPlayer].score++;
  };
  if (row > 0) {
    const currentTarget = squares[target.key - 1];
    const edge = getRemainingSide(currentTarget);
    if (edge) {
      registerRoom(currentTarget, edge);
      memo[currentTarget.key] = true;
      checkNeighbors(currentTarget, row - 1, col, memo);
    }
  }
  if (row < gridsize - 1) {
    const currentTarget = squares[target.key + 1];
    const edge = getRemainingSide(currentTarget);
    if (edge) {
      registerRoom(currentTarget, edge);
      memo[currentTarget.key] = true;
      checkNeighbors(currentTarget, row + 1, col, memo);
    }
  }
  if (col > 0) {
    const currentTarget = squares[target.key - gridsize];
    const edge = getRemainingSide(currentTarget);
    if (edge) {
      registerRoom(currentTarget, edge);
      memo[currentTarget.key] = true;
      checkNeighbors(currentTarget, row, col - 1, memo);
    }
  }
  if (col < gridsize - 1) {
    const currentTarget = squares[target.key + gridsize];
    const edge = getRemainingSide(currentTarget);
    if (edge) {
      registerRoom(currentTarget, edge);
      memo[currentTarget.key] = true;
      checkNeighbors(currentTarget, row, col + 1, memo);
    }
  }
};

canvas.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});
