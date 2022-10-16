import CommandResult from "./commandResults";
import { DEFAULT_START_INDEX, EDGE, H, W } from "./constants";
import { range } from "./helpers";
import { tetrominos } from "./tetrominos";
const { UIPlugin } = o_spreadsheet;
const { uiPluginRegistry } = o_spreadsheet.registries;

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
    this.game = false;
    this.tetrisSheetId = "";
    this.grid = undefined;
    this.currentForms = undefined;
    this.currentStyle = undefined;
    this.currentPosition = undefined;
    this.currentElement = undefined;
    this.currentIndex = undefined;
  }

  allowDispatch(cmd) {
    switch (cmd.type) {
      case "START_TETRIS":
      case "MOVE_TT_LEFT":
      case "MOVE_TT_RIGHT":
      case "MOVE_TT_DOWN":
      case "DROP_TT":
      case "ROTATE_TT":
      case "STOP_TETRIS":
        if (!!this.game) {
          return CommandResult.NoTetrisRunning;
        }
        break;
    }
    return CommandResult.Success;
  }
  handle(cmd) {
    switch (cmd.type) {
      case "START_TETRIS":
        this._initGame();
        break;
      case "MOVE_LEFT":
        break;
      case "MOVE_RIGHT":
        break;
      case "MOVE_DOWN":
        break;
      case "DROP":
        break;
      case "ROTATE_TT":
        break;
      case "ACTIVATE_SHEET":
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
  }
  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------

  /**
   * @returns {boolean}
   */
  isTetrisRunning() {
    return !!this.game;
  }

  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------
  _initGame() {
    const sheetNumber = this.getters.getSheetIds().length;
    this.tetrisSheetId = "tetris";
    this.dispatch("CREATE_SHEET", {
      position: sheetNumber,
      name: "tetris",
      sheetId: this.tetrisSheetId,
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
    this.grid = new Array(W * H);
    this._newPiece();
  }

  _stopGame() {
    console.log("SHOULD RESET EVERYTHING");
  }

  _newPiece() {
    const { forms, style } = getRandomElement(tetrominos);
    this.currentIndex = 0;
    this.currentStyle = style;
    this.currentForms = forms;
    this.currentElement = this.currentForms[this.currentIndex];
    this.currentPosition = getStartIndex(this.currentElement);
  }
}

TetrisPlugin.modes = ["normal"];
TetrisPlugin.getters = ["isTetrisRunning"];

uiPluginRegistry.add("tetrisPlugin", TetrisPlugin);
