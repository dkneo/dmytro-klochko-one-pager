const STORAGE_KEY = "scout:new-highlights-hidden";

function readHidden(storage) {
  try {
    return storage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeHidden(storage, hidden) {
  try {
    if (hidden) storage.setItem(STORAGE_KEY, "1");
    else storage.removeItem(STORAGE_KEY);
  } catch {
    // Highlighting remains usable when browser storage is unavailable.
  }
}

export function bindHighlightToggle(root, button, storage) {
  let hidden = readHidden(storage);

  const render = () => {
    root.dataset.newHighlights = hidden ? "hidden" : "shown";
    button.textContent = hidden ? "show new highlights" : "hide highlights";
    button.setAttribute("aria-pressed", String(!hidden));
  };

  button.addEventListener("click", () => {
    hidden = !hidden;
    writeHidden(storage, hidden);
    render();
  });

  render();
}

