# drop

Leave work here and the other agent finds it. No zips, no sending files.

Codex writes its output straight into this folder instead of exporting to
`~/Documents/Codex/<date>/…/outputs/`. Claude checks it at the start of a
session with `node scripts/drop.mjs`.

Anything goes: images, html, svg, notes. One rule, so the pickup is
unambiguous:

**Name the file for where it belongs.**

    scene-ember.jpg           → becomes a site scene
    press-logo-nature.svg     → a press wordmark
    pond-frog.png             → the pond game
    scout-adlibrary.png       → scout school (the taso course)
    names-folio.html          → the /names folio (goes to KV)
    note-whatever.md          → just read it

If it does not fit a prefix, drop it anyway and say what it is in
`drop/notes.md`. A wrong name costs a question; a zip costs a round trip.

Filed items move out of here to where they belong, so an empty `drop/` means
everything has been picked up. Nothing is deleted without being placed first.

`drop/` is gitignored apart from this README: raw material stays off the
public repo, exactly like `contents/`.
