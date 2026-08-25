export function fitEaselFrame(
  width,
  height,
  { targetArea = 154000, maxWidth = 480, maxHeight = 512 } = {},
) {
  if (
    !(width > 0) ||
    !(height > 0) ||
    !(targetArea > 0) ||
    !(maxWidth > 0) ||
    !(maxHeight > 0)
  ) {
    throw new TypeError("easel dimensions must be positive numbers");
  }

  const ratio = width / height;
  const areaWidth = Math.sqrt(targetArea * ratio);
  const areaHeight = areaWidth / ratio;
  const scale = Math.min(1, maxWidth / areaWidth, maxHeight / areaHeight);

  return {
    width: Math.round(areaWidth * scale),
    height: Math.round(areaHeight * scale),
    ratio,
  };
}
