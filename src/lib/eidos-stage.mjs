export function setDiscoveryStage({ card, backing, controls, note }, state) {
  const hasArtwork = state === "artwork";
  card.hidden = !hasArtwork;
  backing.hidden = !hasArtwork;
  controls.hidden = !hasArtwork;
  note.hidden = hasArtwork;
}
