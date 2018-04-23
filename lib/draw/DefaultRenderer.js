// import {inherits as inherits} from 'inherits';
var inherits = require('inherits');
import BaseRenderer from './BaseRenderer';
import { componentsToPath, createLine } from '../util/RenderUtil';
import { append as svgAppend, attr as svgAttr, create as svgCreate } from 'tiny-svg';
// apply default renderer with lowest possible priority
// so that it only kicks in if noone else could render
var DEFAULT_RENDER_PRIORITY = 1;
/**
 * The default renderer used for shapes and connections.
 *
 * @param {EventBus} eventBus
 * @param {Styles} styles
 */
var DefaultRenderer = /** @class */ (function () {
    function DefaultRenderer(eventBus, styles) {
        this.canRender = function () {
            return true;
        };
        this.drawShape = function drawShape(visuals, element) {
            var rect = svgCreate('rect');
            svgAttr(rect, {
                x: 0,
                y: 0,
                width: element.width || 0,
                height: element.height || 0
            });
            svgAttr(rect, this.SHAPE_STYLE);
            svgAppend(visuals, rect);
            return rect;
        };
        this.drawConnection = function drawConnection(visuals, connection) {
            var line = createLine(connection.waypoints, this.CONNECTION_STYLE);
            svgAppend(visuals, line);
            return line;
        };
        this.getShapePath = function getShapePath(shape) {
            var x = shape.x, y = shape.y, width = shape.width, height = shape.height;
            var shapePath = [
                ['M', x, y],
                ['l', width, 0],
                ['l', 0, height],
                ['l', -width, 0],
                ['z']
            ];
            return componentsToPath(shapePath);
        };
        this.getConnectionPath = function getConnectionPath(connection) {
            var waypoints = connection.waypoints;
            var idx, point, connectionPath = [];
            for (idx = 0; (point = waypoints[idx]); idx++) {
                // take invisible docking into account
                // when creating the path
                point = point.original || point;
                connectionPath.push([idx === 0 ? 'M' : 'L', point.x, point.y]);
            }
            return componentsToPath(connectionPath);
        };
        BaseRenderer.call(this, eventBus, DEFAULT_RENDER_PRIORITY);
        this.CONNECTION_STYLE = styles.style(['no-fill'], { strokeWidth: 5, stroke: 'fuchsia' });
        this.SHAPE_STYLE = styles.style({ fill: 'white', stroke: 'fuchsia', strokeWidth: 2 });
    }
    DefaultRenderer.$inject = ['eventBus', 'styles'];
    return DefaultRenderer;
}());
export default DefaultRenderer;
inherits(DefaultRenderer, BaseRenderer);
// DefaultRenderer.$inject = ['eventBus', 'styles'];
//# sourceMappingURL=DefaultRenderer.js.map