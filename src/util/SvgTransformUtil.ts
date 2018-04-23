import {
	transform as svgTransform,
	createTransform
} from 'tiny-svg';

// const {
// 	transform,
// 	createTransform
// } = require('tiny-svg');


/**
 * @param {<SVGElement>} element
 * @param {Number} x
 * @param {Number} y
 * @param {Number} angle
 * @param {Number} amount
 */
export function transform(gfx: SVGAElement, x: number, y: number, angle: number, amount: number): void {
	var translate = createTransform();
	translate.setTranslate(x, y);

	var rotate = createTransform();
	rotate.setRotate(angle, 0, 0);

	var scale = createTransform();
	scale.setScale(amount || 1, amount || 1);

	svgTransform(gfx, [translate, rotate, scale]);
}


/**
 * @param {SVGElement} element
 * @param {Number} x
 * @param {Number} y
 */
export function translate(gfx: SVGElement, x: number, y: number): void {
	var translate = createTransform();
	translate.setTranslate(x, y);

	svgTransform(gfx, translate);
}


/**
 * @param {SVGElement} element
 * @param {Number} angle
 */
export function rotate(gfx: SVGElement, angle: number): void {
	var rotate = createTransform();
	rotate.setRotate(angle, 0, 0);

	svgTransform(gfx, rotate);
}


/**
 * @param {SVGElement} element
 * @param {Number} amount
 */
export function scale(gfx: SVGElement, amount: number): void {
	var scale = createTransform();
	scale.setScale(amount, amount);

	svgTransform(gfx, scale);
}