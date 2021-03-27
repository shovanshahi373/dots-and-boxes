export const createBoard = (size = 10) => {
  return new Array(size).fill(0).map((row, y) => {
    const start = y * size;
    return new Array(size).fill(start + y);
  });
};
