// import {
// 	attr as svgAttr,
// 	create as svgCreate
// } from 'tiny-svg';
var _a = require('tiny-svg'), attr = _a.attr, create = _a.create;
export function componentsToPath(elements) {
    return elements.join(',').replace(/,?([A-z]),?/g, '$1');
}
export function toSVGPoints(points) {
    var result = '';
    for (var i = 0, p; (p = points[i]); i++) {
        result += p.x + ',' + p.y + ' ';
    }
    return result;
}
export function createLine(points, attrs) {
    var line = create('polyline');
    attr(line, { points: toSVGPoints(points) });
    if (attrs) {
        attr(line, attrs);
    }
    return line;
}
export function updateLine(gfx, points) {
    attr(gfx, { points: toSVGPoints(points) });
    return gfx;
}
//# sourceMappingURL=RenderUtil.js.map