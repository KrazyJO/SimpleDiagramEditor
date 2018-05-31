//---------------------IMPORTS---------------------
// import { attr as svgAttr, create as svgCreate } from 'tiny-svg';

//---------------------CONSTANTS---------------------
const RESOLUTION = 20;

//---------------------METHODS---------------------
export function snapTo(x, y, resolution?) {
  const gridX = round(x, resolution || RESOLUTION);
  const gridY = round(y, resolution || RESOLUTION);

  return {
    x: gridX,
    y: gridY
  };
}

function round(p, n) {
  return p % n < n / 2 ? p - p % n : p + n - p % n;
}
