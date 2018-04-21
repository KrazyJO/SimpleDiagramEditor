import { Point } from "./Geometry";

/**
 * Get the logarithm of x with base 10
 * @param  {Integer} value
 */
export function log10(x : number) {
  return Math.log(x) / Math.log(10);
}


export function substract(p1 : Point, p2 : Point) {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y
  };
}