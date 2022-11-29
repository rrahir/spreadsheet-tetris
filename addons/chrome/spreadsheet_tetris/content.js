let currentBrowser;
if (navigator.userAgent.indexOf("Chrome") !== -1) {
  currentBrowser = chrome;
} else {
  currentBrowser = browser;
}

document.addEventListener("loadTetris", function (e) {
    const { isSpreadsheet } = e.detail;
    if (isSpreadsheet) {
      const scriptEl = document.createElement("script");
      const url = currentBrowser.runtime.getURL("spreadsheet_tetris.js");
      scriptEl.src = url;
      (document.head || document.documentElement).appendChild(scriptEl);
      scriptEl.onload = function () {
        scriptEl.parentNode.removeChild(scriptEl);
      };
    }
  });


const scriptEl = document.createElement("script");
const url2 = currentBrowser.runtime.getURL("load_tetris.js");
scriptEl.src = url2;
(document.head || document.documentElement).appendChild(scriptEl);
scriptEl.onload = function () {
  scriptEl.parentNode.removeChild(scriptEl);
};
