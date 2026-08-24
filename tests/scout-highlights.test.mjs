import assert from "node:assert/strict";
import test from "node:test";

import { bindHighlightToggle } from "../public/scripts/scout-highlights.js";

class TestButton extends EventTarget {
  attributes = new Map();
  textContent = "";

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }
}

function storageWith(value = null) {
  const values = new Map(value === null ? [] : [["scout:new-highlights-hidden", value]]);
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, next) { values.set(key, next); },
    removeItem(key) { values.delete(key); },
  };
}

test("new Scout sections begin highlighted and can be hidden for the session", () => {
  const root = { dataset: {} };
  const button = new TestButton();
  const storage = storageWith();

  bindHighlightToggle(root, button, storage);
  assert.equal(root.dataset.newHighlights, "shown");
  assert.equal(button.textContent, "hide highlights");
  assert.equal(button.getAttribute("aria-pressed"), "true");

  button.dispatchEvent(new Event("click"));
  assert.equal(root.dataset.newHighlights, "hidden");
  assert.equal(button.textContent, "show new highlights");
  assert.equal(button.getAttribute("aria-pressed"), "false");
  assert.equal(storage.getItem("scout:new-highlights-hidden"), "1");
});

test("a hidden-session preference can restore the highlights", () => {
  const root = { dataset: {} };
  const button = new TestButton();
  const storage = storageWith("1");

  bindHighlightToggle(root, button, storage);
  assert.equal(root.dataset.newHighlights, "hidden");

  button.dispatchEvent(new Event("click"));
  assert.equal(root.dataset.newHighlights, "shown");
  assert.equal(storage.getItem("scout:new-highlights-hidden"), null);
});

