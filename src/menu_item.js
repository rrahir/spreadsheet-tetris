import { CLOCK } from "./constants";

const { topbarMenuRegistry } = o_spreadsheet.registries;

let tetrisSheetId = "";

function registerTetrisControls(fn) {
  window.addEventListener("keydown", fn, true);
}
function unregisterTetrisControls(fn) {
  window.removeEventListener("keydown", fn, true);
}

function tetrisControls(ev, env) {
  switch (ev.key) {
    case "ArrowLeft":
      // Left pressed
      env.model.dispatch("MOVE_TT_LEFT");
      ev.stopPropagation();
      break;
    case "ArrowRight":
      // Right pressed
      env.model.dispatch("MOVE_TT_RIGHT");
      ev.stopPropagation();
      break;
    case "ArrowUp":
      // Up pressed
      env.model.dispatch("ROTATE_TT");
      ev.stopPropagation();
      break;
    case "ArrowDown":
      env.model.dispatch("MOVE_TT_DOWN");
      ev.stopPropagation();
      break;
    case "space":
      // should drop the tetromino at the lowest possible place
      // can be factorized to make a ghost value
      console.log("not implemented");
      break;
  }
}

let timerId = undefined;
let fn = undefined;
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

      fn = (ev) => tetrisControls(ev, env);
      registerTetrisControls(fn);
      timerId = setInterval(() => {
        if (!env.model.getters.isTetrisRunning()) {
          env.model.dispatch("STOP_TETRIS");
          unregisterTetrisControls(fn);
          clearInterval(timerId);
        }
      }, CLOCK / 2);
    },
    isVisible: (env) => !env.model.getters.isTetrisRunning(),
  })
  .addChild("tetris", ["fun", "tetris"], {
    name: "Stop",
    sequence: 1,
    action: (env) => {
      env.model.dispatch("STOP_TETRIS");
      unregisterTetrisControls(fn);
    },
    isVisible: (env) => env.model.getters.isTetrisRunning(),
  });
