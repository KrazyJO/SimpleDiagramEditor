import {
	isObject,
	assign,
	pick,
	forEach,
	reduce
} from 'min-dash';

import {
	append as svgAppend,
	attr as svgAttr,
	create as svgCreate,
	remove as svgRemove
} from 'tiny-svg';

// const {
// 	append,
// 	attr,
// 	create,
// 	remove
// } = require('tiny-svg');

var DEFAULT_BOX_PADDING = 0;

var DEFAULT_LABEL_SIZE = {
	width: 150,
	height: 50
};


function parseAlign(align: string): any {

	var parts = align.split('-');

	return {
		horizontal: parts[0] || 'center',
		vertical: parts[1] || 'top'
	};
}

function parsePadding(padding: any) {

	if (isObject(padding)) {
		return assign({ top: 0, left: 0, right: 0, bottom: 0 }, padding);
	} else {
		return {
			top: padding,
			left: padding,
			right: padding,
			bottom: padding
		};
	}
}

function getTextBBox(text: any, fakeText: any): any {

	fakeText.textContent = text;

	try {
		var bbox,
			emptyLine = text === '';

		// add dummy text, when line is empty to determine correct height
		fakeText.textContent = emptyLine ? 'dummy' : text;

		bbox = pick(fakeText.getBBox(), ['width', 'height']);

		if (emptyLine) {
			// correct width
			bbox.width = 0;
		}

		return bbox;
	} catch (e) {
		return { width: 0, height: 0 };
	}
}


/**
 * Layout the next line and return the layouted element.
 *
 * Alters the lines passed.
 *
 * @param  {Array<String>} lines
 * @return {Object} the line descriptor, an object { width, height, text }
 */
function layoutNext(lines: string[], maxWidth: any, fakeText: any): any {

	var originalLine = lines.shift(),
		fitLine = originalLine;

	var textBBox;

	for (; ;) {
		textBBox = getTextBBox(fitLine, fakeText);

		textBBox.width = fitLine ? textBBox.width : 0;

		// try to fit
		if (fitLine === ' ' || fitLine === '' || textBBox.width < Math.round(maxWidth) || fitLine.length < 2) {
			return fit(lines, fitLine, originalLine, textBBox);
		}

		fitLine = shortenLine(fitLine, textBBox.width, maxWidth);
	}
}

function fit(lines: string[], fitLine: any, originalLine: any, textBBox: any) {
	if (fitLine.length < originalLine.length) {
		var remainder = originalLine.slice(fitLine.length).trim();

		lines.unshift(remainder);
	}
	return { width: textBBox.width, height: textBBox.height, text: fitLine };
}


/**
 * Shortens a line based on spacing and hyphens.
 * Returns the shortened result on success.
 *
 * @param  {String} line
 * @param  {Number} maxLength the maximum characters of the string
 * @return {String} the shortened string
 */
function semanticShorten(line: String, maxLength: number): string {
	var parts = line.split(/(\s|-)/g),
		part,
		shortenedParts = [],
		length = 0;

	// try to shorten via spaces + hyphens
	if (parts.length > 1) {
		while ((part = parts.shift())) {
			if (part.length + length < maxLength) {
				shortenedParts.push(part);
				length += part.length;
			} else {
				// remove previous part, too if hyphen does not fit anymore
				if (part === '-') {
					shortenedParts.pop();
				}

				break;
			}
		}
	}

	return shortenedParts.join('');
}


function shortenLine(line: string, width: number, maxWidth: number) {
	var length = Math.max(line.length * (maxWidth / width), 1);

	// try to shorten semantically (i.e. based on spaces and hyphens)
	var shortenedLine = semanticShorten(line, length);

	if (!shortenedLine) {

		// force shorten by cutting the long word
		shortenedLine = line.slice(0, Math.max(Math.round(length - 1), 1));
	}

	return shortenedLine;
}


function getHelperSvg() {
	var helperSvg : any = document.getElementById('helper-svg');

	if (!helperSvg) {
		helperSvg = svgCreate('svg');

		svgAttr(helperSvg, {
			id: 'helper-svg',
			width: 0,
			height: 0,
			style: 'visibility: hidden; position: fixed'
		});

		document.body.appendChild(helperSvg);
	}

	return helperSvg;
}

function getLineHeight(style) : any {
	if ('fontSize' in style && 'lineHeight' in style) {
		return style.lineHeight * parseInt(style.fontSize, 10);
	}
}

/**
 * Creates a new label utility
 *
 * @param {Object} config
 * @param {Dimensions} config.size
 * @param {Number} config.padding
 * @param {Object} config.style
 * @param {String} config.align
 */
export default class Text {

	public _config: any;
	constructor(config: any) {
		this._config = assign({}, {
			size: DEFAULT_LABEL_SIZE,
			padding: DEFAULT_BOX_PADDING,
			style: {},
			align: 'center-top'
		}, config || {});

	}

	/**
	 * Returns the layouted text as an SVG element.
	 *
	 * @param {String} text
	 * @param {Object} options
	 *
	 * @return {SVGElement}
	 */
	public createText(text, options) {
		return this.layoutText(text, options).element;
	};

	/**
	 * Returns a labels layouted dimensions.
	 *
	 * @param {String} text to layout
	 * @param {Object} options
	 *
	 * @return {Dimensions}
	 */
	public getDimensions(text, options) {
		return this.layoutText(text, options).dimensions;
	};

	public layoutText(text, options) {
		var box = assign({}, this._config.size, options.box),
			style = assign({}, this._config.style, options.style),
			align = parseAlign(options.align || this._config.align),
			padding = parsePadding(options.padding !== undefined ? options.padding : this._config.padding),
			fitBox = options.fitBox || false,
			addToY = options.addToY || 0;
	  
		var lineHeight = getLineHeight(style);
	  
		var lines = text.split(/\r?\n/g),
			layouted = [];
	  
		var maxWidth = box.width - padding.left - padding.right;
	  
		// ensure correct rendering by attaching helper text node to invisible SVG
		var helperText = svgCreate('text');
		svgAttr(helperText, { x: 0, y: 0 });
		svgAttr(helperText, style);
	  
		var helperSvg = getHelperSvg();
	  
		svgAppend(helperSvg, helperText);
	  
		while (lines.length) {
		  layouted.push(layoutNext(lines, maxWidth, helperText));
		}
	  
		var totalHeight = reduce(layouted, function(sum, line, idx) {
		  return sum + (lineHeight || line.height);
		}, 0);
	  
		var maxLineWidth = reduce(layouted, function(sum, line, idx) {
		  return line.width > sum ? line.width : sum;
		}, 0);
	  
		// the y position of the next line
		var y;
	  
		switch (align.vertical) {
		case 'middle':
		  y = (box.height - totalHeight) / 2;
		  break;
	  
		default:
		  y = padding.top;
		}
	  
		// magic number initial offset
		y -= (lineHeight || layouted[0].height) / 4;
	  
	  
		var textElement = svgCreate('text');
	  
		svgAttr(textElement, style);
	  
		// layout each line taking into account that parent
		// shape might resize to fit text size
		forEach(layouted, function(line) {
	  
		  var x;
	  
		  y += (lineHeight || line.height);
	  
		  switch (align.horizontal) {
		  case 'left':
			x = padding.left;
			break;
	  
		  case 'right':
			x = ((fitBox ? maxLineWidth : maxWidth)
			  - padding.right - line.width);
			break;
	  
		  default:
			// aka center
			x = Math.max((((fitBox ? maxLineWidth : maxWidth)
			  - line.width) / 2 + padding.left), 0);
		  }
	  
		  y += addToY;

		  var tspan = svgCreate('tspan');
		  svgAttr(tspan, { x: x, y: y });
	  
		  tspan.textContent = line.text;
	  
		  svgAppend(textElement, tspan);
		});
	  
		svgRemove(helperText);
	  
		var dimensions = {
		  width: maxLineWidth,
		  height: totalHeight
		};
	  
		return {
		  dimensions: dimensions,
		  element: textElement
		};
	  };

}



// interface options {
// 	align: string,
// 	style: string,
// 	fitBox: boolean,
// 	box: any,
// 	padding: any
// }

