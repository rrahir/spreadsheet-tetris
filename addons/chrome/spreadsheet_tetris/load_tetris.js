let spreadsheet_loaded = false;
if (window.o_spreadsheet && !spreadsheet_loaded) {
  const ev = new CustomEvent("loadTetris", { detail: { isSpreadsheet: !!window.o_spreadsheet } });
  document.dispatchEvent(ev);
  spreadsheet_loaded = true;
}

// Create an observer instance linked to the callback function
const observer = new MutationObserver((mutationList, observer) => {
  if (window.o_spreadsheet && !spreadsheet_loaded) {
    const ev = new CustomEvent("loadTetris", { detail: { isSpreadsheet: !!window.o_spreadsheet } });
    document.dispatchEvent(ev);
    spreadsheet_loaded = true;
  }
});

observer.observe(document, {
    childList: true, // observe direct children
    subtree: true, // and lower descendants too
    characterDataOldValue: true // pass old data to callback
});
