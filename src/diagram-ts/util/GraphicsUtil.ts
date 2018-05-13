// import {
// 	query as domQuery
// } from 'min-dom';

const {
	query
} = require('min-dom');

/**
 * SVGs for elements are generated by the {@link GraphicsFactory}.
 *
 * This utility gives quick access to the important semantic
 * parts of an element.
 */

/**
 * Returns the visual part of a diagram element
 *
 * @param {Snap<SVGElement>} gfx
 *
 * @return {Snap<SVGElement>}
 */
export function getVisual(gfx: SVGElement): SVGElement {
	return query('.djs-visual', gfx);
}

/**
 * Returns the children for a given diagram element.
 *
 * @param {Snap<SVGElement>} gfx
 * @return {Snap<SVGElement>}
 */
export function getChildren(gfx: SVGElement): Node {
	return gfx.parentNode.childNodes[1];
}