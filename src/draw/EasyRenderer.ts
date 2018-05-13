//---------------------IMPORTS---------------------
import { assign, isObject } from 'lodash';
import { is } from '../Util/ModelUtil';
import { createLine } from '../diagram-ts/util/RenderUtil';
import BaseRenderer from '../diagram-ts/draw/BaseRenderer';
import  TextUtil from '../diagram-ts/util/Text';
import {append as svgAppend} from 'tiny-svg';
import {query as domQuery} from 'min-dom';// = require('min-dom/lib/query');
// import svgAppend = require('tiny-svg/lib/append');
import {attr as svgAttr} from 'tiny-svg';
import {create as svgCreate} from 'tiny-svg';
// import {clear as svgClear} from 'tiny-svg';
import {classes as svgClasses} from 'tiny-svg';
import EventBus from '../diagram-ts/core/EventBus';
import Styles from '../diagram-ts/draw/Styles';
import Canvas from '../diagram-ts/core/Canvas';

//---------------------CONSTANTS---------------------
const LABEL_STYLE = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px'
};

//---------------------CLASS--------------------
export default class EasyRenderer extends BaseRenderer {
  //---------------------ATTRIBUTES---------------------
  markers = {};
  computeStyle: any;
  public textUtil: any;
  handlers: any;
  canvas: any;

  //---------------------CONSTRUCTOR---------------------
  constructor(eventBus : EventBus, styles : Styles, canvas : Canvas, priority : any) {
    super(eventBus, priority);
    this.textUtil = new TextUtil({
        style: LABEL_STYLE,
        size: {width: 100}
    });
    this.canvas = canvas;
    this.computeStyle = styles.computeStyle;
    const CONNECTION_STYLE = styles.style(['no-fill'], {strokeWidth: 2, stroke: 'black'});
    this.initMarker();
    const STYLE = styles.style({
        fillOpacity: 1,
        stroke: 'black',
        strokeWidth: 2
    });
    this.handlers = {
      'ea:Node': (visuals : any, element : any) => {
        return this.drawRect(visuals, element.width || 0, element.height || 0, STYLE);
      },
      'ea:Edge': (visuals : any, element : any) => {
        return this.drawLine(visuals, element.waypoints, CONNECTION_STYLE);
      }
    };
  }

  //---------------------METHODS---------------------
  addMarker(id : any, element : any) {
    this.markers[id] = element;
  }

  marker(id : any) {
    return this.markers[id];
  }

  getMarker(id : any) {
    return `url(#${id})`;
  }

  initMarker() {
    const self = this;
    function createMarker(id : any, options : any) {
      const attrs = assign({
        fill: 'black',
        strokeWidth: 1
      }, options.attrs);
      const ref = options.ref || { x: 0, y: 0 };
      const scale = options.scale || 1;
      if(attrs.strokeDasharray === 'none') {
        attrs.strokeDasharray = [10000, 1];
      }
      const marker = svgCreate('marker');
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
      let defs = domQuery('defs', self.canvas._svg);
      if(!defs) {
        defs = svgCreate('defs');
        svgAppend(self.canvas._svg, defs);
      }
      svgAppend(defs, marker);
      self.addMarker(id, marker);
    }

    const path1 = svgCreate('path');
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
  }

  drawRect(visuals : any, width : any, height : any, offset : any, attrs? : any) {
    if(isObject(offset)) {
      attrs = offset;
      offset = 0;
    }
    offset = offset || 0;
    attrs = this.computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });
    const rect = svgCreate('rect');
    svgAttr(rect, {
      x: offset,
      y: offset,
      width: width - offset * 2,
      height: height - offset * 2,
    });
    svgAttr(rect, attrs);
    svgAppend(visuals, rect);
    return rect;
  }

  drawLine(p : any, waypoints : any, attrs? : any) {
    attrs = this.computeStyle(attrs, [ 'no-fill' ], {
        stroke: 'slategray',
        strokeWidth: 2,
        fill: 'white'
    });
    const line = createLine(waypoints, attrs);
    svgAppend(p, line);
    return line;
  }

  renderLabel(p : any, label : any, options : any) {
    const text = this.textUtil.createText(p, label || '', options);
    svgClasses(text).add('djs-label');
    return text;
  }

  canRender(element : any): boolean {
    return is(element, 'uml:Element') || is(element, 'label');
  }

  drawShape(visuals : any, element : any) {
    const handler = this.handlers[element.type];
    return handler(visuals, element);
  }

  drawConnection(visuals : any, element : any) {
    const handler = this.handlers[element.type];
    return handler(visuals, element);
  }
}

(EasyRenderer as any).$inject = ['eventBus', 'styles', 'canvas'];
