import { Point } from "./Geometry";

export function center(bounds : any) : Point {
  return {
    x: bounds.x + (bounds.width / 2),
    y: bounds.y + (bounds.height / 2)
  };
}


export function delta(a : Point, b : Point) : Point {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}