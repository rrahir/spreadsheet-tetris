import CommandResult from "./commandResults";
import { CLOCK, DEFAULT_START_INDEX, EDGE, H, W } from "./constants";
import { range } from "./helpers";
import { tetrominos } from "./tetrominos";
const { UIPlugin } = o_spreadsheet;
const { featurePluginRegistry } = o_spreadsheet.registries;

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getStartIndex(element) {
  const minPosition = Math.min(...element);
  return DEFAULT_START_INDEX - Math.floor(minPosition / W) * W;
}

class TetrisPlugin extends UIPlugin {
  constructor() {
    super(...arguments);
    this.state = "not_running";
    this.tetrisSheetId = "";
    this.grid = undefined;
    this.currentForms = undefined;
    this.currentStyle = undefined;
    this.currentPosition = undefined;
    this.currentElement = undefined;
    this.currentIndex = undefined;
    this.timerId = undefined;
    this.checkLineArray = Array.from({ length: W }, (_, index) => index);
    this.score = 0;
  }

  allowDispatch(cmd) {
    switch (cmd.type) {
      case "MOVE_TT_LEFT":
      case "MOVE_TT_RIGHT":
      case "MOVE_TT_DOWN":
      case "DROP_TT":
      case "ROTATE_TT":
        if (this.state !== "running") {
          return CommandResult.NoTetrisRunning;
        }
        break;
      case "START_TETRIS":
        if (this.state === "running") {
          return CommandResult.TetrisRunning;
        }
    }
    return CommandResult.Success;
  }

  handle(cmd) {
    switch (cmd.type) {
      case "START_TETRIS":
        this._initGame();
        break;
      case "MOVE_TT_LEFT":
        this._moveLeft();
        break;
      case "MOVE_TT_RIGHT":
        this._moveRight();
        break;
      case "MOVE_TT_DOWN":
        this._moveDown();
        break;
      case "DROP":
        break;
      case "ROTATE_TT":
        this._rotation();
        break;
      case "ACTIVATE_SHEET":
        if (this.isTetrisRunning()) {
          this._stopGame();
        }
        break;
      case "STOP_TETRIS":
        this._stopGame();
        break;
      case "DELETE_SHEET": {
        if (cmd.sheetId === this.tetrisSheetId) {
          this._stopGame();
        }
        break;
      }
    }
    switch (cmd.type) {
      case "START_TETRIS":
      case "MOVE_TT_LEFT":
      case "MOVE_TT_RIGHT":
      case "MOVE_TT_DOWN":
      case "DROP":
      case "ROTATE_TT":
        this.draw();
    }
  }
  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------

  /**
   * @returns {boolean}
   */
  isTetrisRunning() {
    return this.state === "running";
  }

  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------
  _initGame() {
    const sheetNumber = this.getters.getSheetIds().length;
    this.tetrisSheetId = "#&@tetris";
    this.dispatch("CREATE_SHEET", {
      position: sheetNumber,
      name: "tetris",
      sheetId: this.tetrisSheetId,
      cols: 10,
      rows: 22,
    });
    this.dispatch("ACTIVATE_SHEET", {
      sheetIdFrom: this.getters.getActiveSheetId(),
      sheetIdTo: this.tetrisSheetId,
    });
    // resize
    this.dispatch("RESIZE_COLUMNS_ROWS", {
      dimension: "COL",
      sheetId: this.tetrisSheetId,
      size: EDGE,
      elements: range(0, 10),
    });
    this.dispatch("RESIZE_COLUMNS_ROWS", {
      dimension: "ROW",
      sheetId: this.tetrisSheetId,
      size: EDGE,
      elements: range(1, 21),
    });
    this.dispatch("RESIZE_COLUMNS_ROWS", {
      dimension: "ROW",
      sheetId: this.tetrisSheetId,
      size: 2 * EDGE,
      elements: [0],
    });
    this.dispatch("ADD_MERGE", {
      sheetId: this.tetrisSheetId,
      force: true,
      target: [{ left: 0, right: 9, top: 0, bottom: 0 }],
    });
    this.dispatch("ADD_MERGE", {
      sheetId: this.tetrisSheetId,
      force: true,
      target: [{ left: 0, right: 9, top: 21, bottom: 21 }],
    });
    this.dispatch("UPDATE_CELL", {
      sheetId: this.tetrisSheetId,
      col: 0,
      row: 0,
      content: "Welcome to Tetris",
      style: {
        bold: true,
        align: "center",
      },
    });
    this.dispatch("SET_FORMATTING", {
      sheetId: this.tetrisSheetId,
      target: [{ left: 0, right: 9, top: 1, bottom: 20 }],
      border: "external",
    });
    this.score = 0;
    this.grid = new Array(W * H);
    this._newPiece();

    this.state = "running";
    this.timerId = setInterval(() => {
      this.draw();
      const contact = this._contact();
      console.log(contact);
      if (!contact) {
        this.currentPosition += W;
      }
    }, CLOCK);
  }

  _stopGame() {
    console.log("SHOULD RESET EVERYTHING");
    this.dispatch("DELETE_SHEET", { sheetId: this.tetrisSheetId });
    this.state = "not_running";
  }

  _newPiece() {
    const { forms, style } = getRandomElement(tetrominos);
    this.currentIndex = 0;
    this.currentStyle = style;
    this.currentForms = forms;
    this.currentElement = this.currentForms[this.currentIndex];
    this.currentPosition = getStartIndex(this.currentElement);
  }

  _moveDown() {
    if (!this._contact()) {
      this.currentPosition += W;
    }
  }

  _moveLeft() {
    const isAtLeftEdge = this.currentElement.some(
      (square) => (this.currentPosition + square) % W === 0
    );
    if (!isAtLeftEdge) {
      this.currentPosition -= 1;
    }
    if (
      this.currentElement.some((index) => this.grid[this.currentPosition + index] !== undefined)
    ) {
      this.currentPosition += 1;
    }
  }

  _moveRight() {
    const isAtRightEdge = this.currentElement.some(
      (square) => (this.currentPosition + square) % W === W - 1
    );
    if (!isAtRightEdge) {
      this.currentPosition += 1;
    }
    if (
      this.currentElement.some((square) => this.grid[this.currentPosition + square] !== undefined)
    ) {
      this.currentPosition -= 1;
    }
  }

  _isLeft() {
    return this.currentElement
      .map((square) => this.currentPosition + square)
      .every((el) => el % W < 4);
  }

  _isRight() {
    return this.currentElement
      .map((square) => this.currentPosition + square)
      .every((el) => el % W > 4);
  }

  _checkRotation(index, position) {
    const element = this.currentForms[index];
    const deltas = element.map((square) => (position + square) % W);

    if (deltas.includes(0) && deltas.includes(W - 1) && this._isRight()) {
      const d = Math.max(...deltas.filter((d) => d < 5));
      return this._checkRotation(index, position - (d + 1));
    }
    if (position >= 5 && element.some((square) => this.grid[position + square] !== undefined)) {
      return [false, false];
    }

    if (deltas.includes(0) && deltas.includes(W - 1) && this._isLeft()) {
      const d = Math.min(...deltas.filter((d) => d > 5));
      return this._checkRotation(index, position + (W - d));
    }
    if (position <= 4 && element.some((square) => this.grid[position + square] !== undefined)) {
      return [false, false];
    }

    return [index, position];
  }

  _rotation() {
    const index = (this.currentIndex + 1) % this.currentForms.length;
    const [newIndex, newPosition] = this._checkRotation(index, this.currentPosition);
    if (newIndex !== false && newPosition !== false) {
      this.currentIndex = newIndex;
      this.currentElement = this.currentForms[this.currentIndex];
      this.currentPosition = newPosition;
    }
  }

  _checkLine() {
    let counter = 0;
    for (let i = 0; i <= H - 1; i++) {
      if (this.checkLineArray.every((index) => this.grid[index + i * W] !== undefined)) {
        console.log("GG michel");

        counter++;
        setTimeout(() => {
          this.checkLineArray.forEach((index) => (this.grid[index + i * W] = undefined));
          for (let j = i; j >= 1; j--) {
            this.checkLineArray.forEach(
              (index) => (this.grid[index + j * W] = this.grid[index + (j - 1) * W])
            );
          }
          this.draw();
          switch (counter) {
            case 1:
              this.score += 40;
              break;
            case 2:
              this.score += 100;
              break;
            case 3:
              this.score += 300;
              break;
            case 4:
              this.score += 1200;
              break;
          }
        }, 0);
      }
    }
  }

  /**
   * @returns {boolean}
   */
  _isGameOver() {
    const lost = this.currentElement.some((square) => {
      return this.grid[square + this.currentPosition] !== undefined;
    });
    if (lost) {
      this.state = "lost";
      clearInterval(this.timerId);
      return true;
    }
    return false;
  }

  /**
   * @returns {boolean}
   */
  _contact() {
    /** check if contact
     * if so then hard code in grid
     * then check if game over
     */
    const contact = this.currentElement.some((square) => {
      const index = square + this.currentPosition;
      return this.grid[index + W] !== undefined || index + W >= W * H;
    });
    if (!contact) {
      return false;
    }
    this.currentElement.forEach((square) => {
      this.grid[this.currentPosition + square] = { color: this.currentStyle.color };
    });

    this._newPiece();
    this._checkLine();
    const isGameOver = this._isGameOver();
    return !isGameOver;
  }

  draw() {
    // clean up
    for (let col = 0; col <= 9; col++) {
      for (let row = 1; row <= 20; row++) {
        this.dispatch("UPDATE_CELL", {
          sheetId: this.tetrisSheetId,
          col,
          row,
          content: undefined,
          style: null,
          format: undefined,
        });
      }
    }

    // draw current element.
    this.currentElement.forEach((square) => {
      const col = (square + this.currentPosition) % W;
      const row = Math.floor((square + this.currentPosition) / W) + 1;
      this.dispatch("UPDATE_CELL", {
        sheetId: this.tetrisSheetId,
        col,
        row,
        content: undefined,
        style: { fillColor: this.currentStyle.color },
        format: undefined,
      });
    });

    // draw frozen pieces
    this.grid.forEach((square, index) => {
      if (!square) {
        return;
      }
      const col = index % W;
      const row = Math.floor(index / W) + 1;
      this.dispatch("UPDATE_CELL", {
        sheetId: this.tetrisSheetId,
        col,
        row,
        content: undefined,
        style: { fillColor: square.color },
        format: undefined,
      });
    });

    // score

    this.dispatch("UPDATE_CELL", {
      sheetId: this.tetrisSheetId,
      col: 0,
      row: 21,
      content: this.score.toString(),
      style: { fillColor: "#93c47d", bold: true },
      format: undefined,
    });
  }
}

TetrisPlugin.modes = ["normal"];
TetrisPlugin.getters = ["isTetrisRunning"];

featurePluginRegistry.add("tetrisPlugin", TetrisPlugin);
