var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//---------------------IMPORTS---------------------
import { assign, isObject } from 'lodash';
import { is } from '../Util/ModelUtil';
import { createLine } from '../diagram-ts/util/RenderUtil';
import BaseRenderer from '../diagram-ts/draw/BaseRenderer';
import TextUtil from '../diagram-ts/util/Text';
import { append as svgAppend } from 'tiny-svg';
import { query as domQuery } from 'min-dom'; // = require('min-dom/lib/query');
// import svgAppend = require('tiny-svg/lib/append');
import { attr as svgAttr } from 'tiny-svg';
import { create as svgCreate } from 'tiny-svg';
// import {clear as svgClear} from 'tiny-svg';
import { classes as svgClasses } from 'tiny-svg';
//---------------------CONSTANTS---------------------
var LABEL_STYLE = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px'
};
//---------------------CLASS--------------------
var EasyRenderer = /** @class */ (function (_super) {
    __extends(EasyRenderer, _super);
    //---------------------CONSTRUCTOR---------------------
    function EasyRenderer(eventBus, styles, canvas, priority) {
        var _this = _super.call(this, eventBus, priority) || this;
        //---------------------ATTRIBUTES---------------------
        _this.markers = {};
        _this.textUtil = new TextUtil({
            style: LABEL_STYLE,
            size: { width: 100 }
        });
        _this.canvas = canvas;
        _this.computeStyle = styles.computeStyle;
        var CONNECTION_STYLE = styles.style(['no-fill'], { strokeWidth: 2, stroke: 'black' });
        _this.initMarker();
        var STYLE = styles.style({
            fillOpacity: 1,
            stroke: 'black',
            strokeWidth: 2
        });
        _this.handlers = {
            'ea:Node': function (visuals, element) {
                return _this.drawRect(visuals, element.width || 0, element.height || 0, STYLE);
            },
            'ea:Edge': function (visuals, element) {
                return _this.drawLine(visuals, element.waypoints, CONNECTION_STYLE);
            }
        };
        return _this;
    }
    //---------------------METHODS---------------------
    EasyRenderer.prototype.addMarker = function (id, element) {
        this.markers[id] = element;
    };
    EasyRenderer.prototype.marker = function (id) {
        return this.markers[id];
    };
    EasyRenderer.prototype.getMarker = function (id) {
        return "url(#" + id + ")";
    };
    EasyRenderer.prototype.initMarker = function () {
        var self = this;
        function createMarker(id, options) {
            var attrs = assign({
                fill: 'black',
                strokeWidth: 1
            }, options.attrs);
            var ref = options.ref || { x: 0, y: 0 };
            var scale = options.scale || 1;
            if (attrs.strokeDasharray === 'none') {
                attrs.strokeDasharray = [10000, 1];
            }
            var marker = svgCreate('marker');
            svgAttr(options.element, attrs);
            svgAppend(marker, options.element);
            svgAttr(marker, {
                id: id,
                viewBox: '0 0 20 20',
                refX: ref.x,
                refY: ref.y,
                markerWidth: 20 * scale,
                markerHeight: 20 * scale,
                orient: 'auto'
            });
            var defs = domQuery('defs', self.canvas._svg);
            if (!defs) {
                defs = svgCreate('defs');
                svgAppend(self.canvas._svg, defs);
            }
            svgAppend(defs, marker);
            self.addMarker(id, marker);
        }
        var path1 = svgCreate('path');
        svgAttr(path1, { d: 'M 1 5 L 11 10 L 1 15 M 1 15 L 1 5' });
        createMarker('connection-end-none', {
            element: path1,
            attrs: {
                fill: 'white',
                stroke: 'slategray',
                strokeWidth: 1
            },
            ref: { x: 12, y: 10 },
            scale: 1
        });
    };
    EasyRenderer.prototype.drawRect = function (visuals, width, height, offset, attrs) {
        if (isObject(offset)) {
            attrs = offset;
            offset = 0;
        }
        offset = offset || 0;
        attrs = this.computeStyle(attrs, {
            stroke: 'black',
            strokeWidth: 2,
            fill: 'white'
        });
        var rect = svgCreate('rect');
        svgAttr(rect, {
            x: offset,
            y: offset,
            width: width - offset * 2,
            height: height - offset * 2,
        });
        svgAttr(rect, attrs);
        svgAppend(visuals, rect);
        return rect;
    };
    EasyRenderer.prototype.drawLine = function (p, waypoints, attrs) {
        attrs = this.computeStyle(attrs, ['no-fill'], {
            stroke: 'slategray',
            strokeWidth: 2,
            fill: 'white'
        });
        var line = createLine(waypoints, attrs);
        svgAppend(p, line);
        return line;
    };
    EasyRenderer.prototype.renderLabel = function (p, label, options) {
        var text = this.textUtil.createText(p, label || '', options);
        svgClasses(text).add('djs-label');
        return text;
    };
    EasyRenderer.prototype.canRender = function (element) {
        return is(element, 'uml:Element') || is(element, 'label');
    };
    EasyRenderer.prototype.drawShape = function (visuals, element) {
        var handler = this.handlers[element.type];
        return handler(visuals, element);
    };
    EasyRenderer.prototype.drawConnection = function (visuals, element) {
        var handler = this.handlers[element.type];
        return handler(visuals, element);
    };
    return EasyRenderer;
}(BaseRenderer));
export default EasyRenderer;
EasyRenderer.$inject = ['eventBus', 'styles', 'canvas'];
//# sourceMappingURL=EasyRenderer.js.map