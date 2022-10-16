(function () {
  'use strict';

  const { topbarMenuRegistry } = o_spreadsheet.registries;

  topbarMenuRegistry
    .add("fun", { name: "Totally Work", sequence: 1000 })
    .addChild("tetris", ["fun"], {
      name: "Tetris",
      sequence: 1,
    })
    .addChild("start", ["fun", "tetris"], {
      name: "Start",
      sequence: 1,
      action: (env) => {
        env.model.dispatch("START_TETRIS");
        // Add listeners that fucks up pretty much every command
        // add setInterval taht will check the game is still running.
        // If not then trigger a "STOP_TETRIS" command
      },
      isVisible: (env) => !env.model.getters.isTetrisRunning(),
    })
    .addChild("tetris", ["fun", "tetris"], {
      name: "Stop",
      sequence: 1,
      action: (env) => {
        env.model.dispatch("STOP_TETRIS");
      },
      isVisible: (env) => env.model.getters.isTetrisRunning(),
    });

  var CommandResult = {
    Success: 0, // should be imported from o-spreadsheet instead of redefined here
    NoTetrisRunning: 9999,
  };

  const W = 10;
  const H = 20;
  const EDGE = 30;

  const DEFAULT_START_INDEX = 3;

  /**
   * Create a range from start (included) to end (excluded).
   * range(10, 13) => [10, 11, 12]
   * range(2, 8, 2) => [2, 4, 6]
   */
  function range(start, end, step = 1) {
    if (end <= start && step > 0) {
      return [];
    }
    if (step === 0) {
      throw new Error("range() step must not be zero");
    }
    const length = Math.ceil(Math.abs((end - start) / step));
    const array = Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = start + i * step;
    }
    return array;
  }

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

  const tetrominos = [
    oTetromino,
    jTetromino,
    lTetromino,
    tTetromino,
    sTetromino,
    zTetromino,
    iTetromino,
  ];

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

})();
//# sourceMappingURL=spreadsheet_tetris.js.map
