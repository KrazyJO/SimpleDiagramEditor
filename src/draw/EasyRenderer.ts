//---------------------IMPORTS---------------------
import { assign, isObject } from 'lodash';
import { is } from '../Util/ModelUtil';
import { createLine } from '../diagram-ts/util/RenderUtil';
import BaseRenderer from '../diagram-ts/draw/BaseRenderer';
import TextUtil from '../diagram-ts/util/Text';
import { append as svgAppend } from 'tiny-svg';
import { query as domQuery } from 'min-dom';
// import svgAppend = require('tiny-svg/lib/append');
import { attr as svgAttr } from 'tiny-svg';
import { create as svgCreate } from 'tiny-svg';
// import {clear as svgClear} from 'tiny-svg';
import { classes as svgClasses } from 'tiny-svg';
import EventBus from '../diagram-ts/core/EventBus';
import Styles from '../diagram-ts/draw/Styles';
import Canvas from '../diagram-ts/core/Canvas';
import {transform} from '../diagram-ts/util/SvgTransformUtil';

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
	textUtil: TextUtil;
	handlers: any;
	canvas: any;

	public static $inject = ['eventBus', 'styles', 'canvas'];

	//---------------------CONSTRUCTOR---------------------
	constructor(eventBus: EventBus, styles: Styles, canvas: Canvas, priority: any) {
		super(eventBus, priority);
		this.textUtil = new TextUtil({
			style: LABEL_STYLE,
			size: { width: 100 }
		});
		this.canvas = canvas;
		this.computeStyle = styles.computeStyle;
		const CONNECTION_STYLE = styles.style(['no-fill'], { strokeWidth: 2, stroke: 'black' });
		this.initMarker();
		const STYLE = styles.style({
			fillOpacity: 1,
			stroke: 'black',
			strokeWidth: 2
		});
		this.handlers = {
			'sde:Node': (visuals: any, element: any) => {
				// return this.drawRect(visuals, element.width || 0, element.height || 0, STYLE);
				const rect = this.drawRect(visuals, element.width || 0, element.height || 0, STYLE);
				this.renderEmbeddedLabel(visuals, element, 'center-top');
				
				//render the line under class name
				let waypoints = [
					{x : 0, y : 25},
					{x : element.width, y : 25}
				]
				this.drawEdge(visuals.parentElement, waypoints, CONNECTION_STYLE, undefined);

				let addToY = 25;
				(element.businessObject.members || []).forEach(member => {
						let text = member.name + ': ' + member.propType + ' = ';
						if (member.propType === "string") {
							text += `"${member.value}"`;
						} else if (member.propType === "Array") {
							//do nothing
							text = member.name + ' : ' + member.propType;
						} else {
							text += member.value;
						}
						this.renderLabel(visuals, text, { box: element, align: 'left', padding: 5, addToY : addToY });
						addToY += 15;
				});
				return rect;
			},
			'sde:Member' : (visuals? : any, element? : any) => {
				return;
			},
			'sde:Edge': (visuals: any, element: any) => {
				const line = this.drawEdge(visuals, element.waypoints, CONNECTION_STYLE, element);
				let x1 = line.animatedPoints[0].x
				let y1 = line.animatedPoints[0].y
				let x2 = line.animatedPoints[1].x
				this.renderLaneLabel(visuals, element.businessObject.name, element, x1, y1, x2);
				return line;
			}
		};
	}

	//---------------------METHODS---------------------
	public addMarker(id: any, element: any) {
		this.markers[id] = element;
	}

	public marker(id: any) {
		return this.markers[id];
	}

	public getMarker(id: any) {
		return `url(#${id})`;
	}

	public initMarker() {
		const self = this;
		function createMarker(id: any, options: any) {
			const attrs = assign({
				fill: 'black',
				strokeWidth: 1
			}, options.attrs);
			const ref = options.ref || { x: 0, y: 0 };
			const scale = options.scale || 1;
			if (attrs.strokeDasharray === 'none') {
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
			if (!defs) {
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

	public drawRect(visuals: any, width: any, height: any, offset: any, attrs?: any) {
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

	public drawEdge(p: any, waypoints: any, attrs?: any, element? : any) {
		attrs = this.computeStyle(attrs, ['no-fill'], {
			stroke: 'slategray',
			strokeWidth: 2,
			fill: 'white'
		});
		const line = createLine(waypoints, attrs);
		svgAppend(p, line);

		return line;
	}

	public renderLaneLabel(p, text, element, x1, y1, x2) {
		var textBox : any = this.renderLabel(p, text, {
			box: {
			  height: 30,
			  width: element.height
			},
			align: 'center-middle',
			style: {
			  fill: 'blue'
			}
		  });
	  
		let x = (x2-x1) / 2;
		transform(textBox, x1+x, y1+1, 0);
	}

	public renderEmbeddedLabel(p, element, align) {
		// return this.renderLabel(p, element.businessObject.name + ':' + element.businessObject.class, { box: element, align: align, padding: 5 });
		return this.renderLabel(p, element.businessObject.class, { box: element, align: align, padding: 5 });
	}

	public renderLabel(p, label, options) {
		const text = this.textUtil.createText(label || '', options);
		svgClasses(text).add('djs-label');
		svgAppend(p, text);
		return text;
	}

	public canRender(element: any): boolean {
		return is(element, 'sde:Element') || is(element, 'label');
	}

	public drawShape(visuals: any, element: any) {
		const handler = this.handlers[element.type];
		return handler(visuals, element);
	}

	public drawConnection(visuals: any, element: any) {
		const handler = this.handlers[element.type];
		return handler(visuals, element);
	}
}
