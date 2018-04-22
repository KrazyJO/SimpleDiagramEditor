import {
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';
import { Point } from '../interfaces';


export function componentsToPath(elements : any) : any {
  return elements.join(',').replace(/,?([A-z]),?/g, '$1');
}

export function toSVGPoints(points : Point[]) {
  var result = '';

  for (var i = 0, p; (p = points[i]); i++) {
    result += p.x + ',' + p.y + ' ';
  }

  return result;
}

export function createLine(points : Point[], attrs : any) {

  var line = svgCreate('polyline');
  svgAttr(line, { points: toSVGPoints(points) });

  if (attrs) {
    svgAttr(line, attrs);
  }

  return line;
}

export function updateLine(gfx : any, points : Point[]) {
  svgAttr(gfx, { points: toSVGPoints(points) });

  return gfx;
}
