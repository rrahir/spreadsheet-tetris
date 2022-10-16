import { W } from "./constants.js";

const oTetromino = {
  forms: [[1, 2, W + 1, W + 2]],
  style: { color: "#FF0" },
};

const jTetromino = {
  forms: [
    [1, 2, W + 1, 2 * W + 1],
    [W, W + 1, W + 2, 2 * W + 2],
    [1, W + 1, 2 * W, 2 * W + 1],
    [0, W, W + 1, W + 2],
  ],
  style: { color: "#FFA500" },
};

const lTetromino = {
  forms: [
    [1, W + 1, 2 * W + 1, 2 * W + 2],
    [W, W + 1, W + 2, 2 * W],
    [0, 1, W + 1, 2 * W + 1],
    [0, W, W + 1, W + 2],
  ],
  style: { color: "#4682B4" },
};

const tTetromino = {
  forms: [
    [W, W + 1, W + 2, 2 * W + 1],
    [1, W, W + 1, 2 * W + 1],
    [W, W + 1, W + 2, 1],
    [1, W + 1, W + 2, 2 * W + 1],
  ],
  style: { color: "#F62EFF" },
};

const sTetromino = {
  forms: [
    [W + 1, W + 2, 2 * W, 2 * W + 1],
    [0, W, W + 1, 2 * W + 1],
  ],
  style: { color: "#79b632" },
};

const zTetromino = {
  forms: [
    [W, W + 1, 2 * W + 1, 2 * W + 2],
    [2, W + 1, W + 2, 2 * W + 1],
  ],
  style: { color: "#F00" },
};

const iTetromino = {
  forms: [
    [W, W + 1, W + 2, W + 3],
    [2, W + 2, 2 * W + 2, 3 * W + 2],
  ],
  style: { color: "#1FC8D5" },
};

export const tetrominos = [
  oTetromino,
  jTetromino,
  lTetromino,
  tTetromino,
  sTetromino,
  zTetromino,
  iTetromino,
];
