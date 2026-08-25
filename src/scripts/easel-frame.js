export function fitEaselFrame(width, height, { maxWidth = 480, maxHeight = 336 } = {}) {
  if (!(width > 0) || !(height > 0) || !(maxWidth > 0) || !(maxHeight > 0)) {
    throw new TypeError("easel dimensions must be positive numbers");
  }

  const scale = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    ratio: width / height,
  };
}
