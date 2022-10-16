const { topbarMenuRegistry } = o_spreadsheet.registries;

let tetrisSheetId = "";

function registerTetrisControls(env) {
  window.addEventListener("keydown", (ev) => tetrisControls(ev, env), true);
}
function unregisterTetrisControls(env) {
  window.removeEventListener("keydown", (ev) => tetrisControls(ev, env), true);
}

function tetrisControls(ev, env) {
  switch (ev.key) {
    case "ArrowLeft":
      // Left pressed
      env.model.dispatch("MOVE_TT_LEFT");
      break;
    case "ArrowRight":
      // Right pressed
      env.model.dispatch("MOVE_TT_RIGHT");
      break;
    case "ArrowUp":
      // Up pressed
      env.model.dispatch("ROTATE_TT");
      break;
    case "ArrowDown":
      env.model.dispatch("MOVE_TT_DOWN");
      break;
    case "space":
      // should drop the tetromino at the lowest possible place
      // can be factorized to make a ghost value
      console.log("not implemented");
      break;
  }
}

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
