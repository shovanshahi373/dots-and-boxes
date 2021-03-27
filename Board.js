import { createBoard } from "./index.js";

export default class Board {
  constructor(size) {
    this.board = createBoard(size);
  }
}
