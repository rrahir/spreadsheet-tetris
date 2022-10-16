import { EDGE, H, W } from "./constants.js";
import { tetrominos } from "./tetromino.js";

const DEFAULT_START_INDEX = 3;
const CLOCK = 500;

let grid, currentForms, currentStyle, currentPosition, currentElement, currentIndex, timerId, aId;

const checkLineArray = Array.from({ length: W }, (_, index) => index);

/** canvas Setup */
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
ctx.translate(-0.5, -0.5);
canvas.id = "myCanvas";
canvas.height = H * EDGE;
canvas.width = W * EDGE;
canvas.style.margin = "auto";
canvas.style.display = "flex";
canvas.style.border = "solid";

const masterDiv = document.querySelector("#master");
masterDiv.appendChild(canvas);

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function gridInit() {
  grid = new Array(W * H);
  newPiece();
}

function newPiece() {
  ({ forms: currentForms, style: currentStyle } = getRandomElement(tetrominos));
  currentIndex = 0;
  currentElement = currentForms[currentIndex];
  currentPosition = getStartIndex();
}

function getStartIndex() {
  const minPosition = Math.min(...currentElement);
  return DEFAULT_START_INDEX - Math.floor(minPosition / W) * W;
}

function render() {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#555";

  // draw current piece
  ctx.fillStyle = currentStyle.color;

  currentElement.forEach((square) => {
    const x = ((square + currentPosition) % W) * EDGE;
    const y = Math.floor((square + currentPosition) / W) * EDGE;
    roundRect(ctx, x, y, EDGE, EDGE, 2, true);
  });

  // draw frozen pieces
  grid.forEach((square, index) => {
    if (!square) {
      return;
    }
    ctx.fillStyle = square.color;
    const x = (index % W) * EDGE;
    const y = Math.floor(index / W) * EDGE;
    roundRect(ctx, x, y, EDGE, EDGE, 2, true);
  });
  ctx.restore();
  aId = window.requestAnimationFrame(() => {
    render();
  });
}

function start() {
  gridInit();

  tick();
  startTick();
  render();
}

function tick() {
  contact();
}

function startTick() {
  if (timerId) {
    return;
  }
  timerId = setInterval(() => {
    currentPosition += W;
    tick();
  }, CLOCK);
}

function stopTick() {
  if (!timerId) {
    return;
  }
  clearInterval(timerId);
}

function contact() {
  /** check if contact
   * if so then hard code in grid
   * then check if game over
   * */
  const contact = currentElement.some((square) => {
    const index = square + currentPosition;
    return grid[index + W] !== undefined || index + W >= W * H;
  });
  if (!contact) {
    return;
  }
  currentElement.forEach((square) => {
    grid[currentPosition + square] = { color: currentStyle.color };
  });

  newPiece();
  checkLine();
  isGameOver();
}

function isGameOver() {
  const lost = currentElement.some((square) => {
    return grid[square + currentPosition] !== undefined;
  });
  if (lost) {
    clearInterval(timerId);
    cancelAnimationFrame(aId);
  }
}

function checkLine() {
  for (let i = 0; i <= H - 1; i++) {
    if (checkLineArray.every((index) => grid[index + i * W] !== undefined)) {
      console.log("GG michel");
      // TODO: add scoring
      setTimeout(() => {
        checkLineArray.forEach((index) => (grid[index + i * W] = undefined));
        for (let j = i; j >= 1; j--) {
          checkLineArray.forEach((index) => (grid[index + j * W] = grid[index + (j - 1) * W]));
        }
      }, CLOCK);
    }
  }
}

document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowLeft":
      // Left pressed
      moveLeft();
      break;
    case "ArrowRight":
      // Right pressed
      moveRight();
      break;
    case "ArrowUp":
      // Up pressed
      rotation();
      break;
    case "ArrowDown":
      currentPosition += W;
      tick();
      break;
    case "space":
      // should drop the tetromino at the lowest possible place
      // can be factorized to make a ghost value
      console.log("not implemented");
      break;
  }
});

function moveLeft() {
  const isAtLeftEdge = currentElement.some((square) => (currentPosition + square) % W === 0);
  if (!isAtLeftEdge) {
    currentPosition -= 1;
  }
  if (currentElement.some((index) => grid[currentPosition + index] !== undefined)) {
    currentPosition += 1;
  }
}

function moveRight() {
  const isAtRightEdge = currentElement.some((square) => (currentPosition + square) % W === W - 1);
  if (!isAtRightEdge) {
    currentPosition += 1;
  }
  if (currentElement.some((square) => grid[currentPosition + square] !== undefined)) {
    currentPosition -= 1;
  }
}

function rotation() {
  const index = (currentIndex + 1) % currentForms.length;
  const [newIndex, newPosition] = checkRotation(index, currentPosition);
  if (newIndex !== false && newPosition !== false) {
    currentIndex = newIndex;
    currentElement = currentForms[currentIndex];
    currentPosition = newPosition;
  }
}

function isLeft() {
  return currentElement.map((square) => currentPosition + square).every((el) => el % W < 4);
}

function isRight() {
  return currentElement.map((square) => currentPosition + square).every((el) => el % W > 4);
}

function checkRotation(index, position) {
  const element = currentForms[index];
  const deltas = element.map((square) => (position + square) % W);

  if (deltas.includes(0) && deltas.includes(W - 1) && isRight()) {
    const d = Math.max(...deltas.filter((d) => d < 5));
    return checkRotation(index, position - (d + 1));
  }
  if (position >= 5 && element.some((square) => grid[position + square] !== undefined)) {
    return [false, false];
  }

  if (deltas.includes(0) && deltas.includes(W - 1) && isLeft()) {
    const d = Math.min(...deltas.filter((d) => d > 5));
    return checkRotation(index, position + (W - d));
  }
  if (position <= 4 && element.some((square) => grid[position + square] !== undefined)) {
    return [false, false];
  }

  return [index, position];
}

start();

/**curtesy of https://stackoverflow.com/a/3368118 */
/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius = 5, fill = false, stroke = true) {
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius };
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
