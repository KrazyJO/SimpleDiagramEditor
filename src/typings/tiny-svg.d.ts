declare module 'tiny-svg' {

	export function append(element : any, target: any) : any;
	export function appendTo(element:any, target:any) : any;
	export function attr(node:any, name:any, value:any) : any;
	export function classes(el:any) : any;
	export function clear(element:any) : any;
	export function clone(element:any) : any;
	export function create(name:any, attrs:any) : any;
	export function innerSVG(element:any,svg:any) : any;
	export function remove(name:any) : any;
	export function replace(element:any, replacement:any) : any;
	export function transform(node:any, transforms:any) : any;
	export function on(node:any, event:any, listener:any, useCapture:any) : any;
	export function off(node:any, event:any, listener:any, useCapture:any) : any;
	export function createPoint(x:any,y:any) : any;
	export function createMatrix(a:any, b:any, c:any, d:any, e:any, f:any) : any;
	export function createTransform(matrix?:any) : any;
	export function select(node:any, selector:any) : any;
	export function selectAll(node:any, selector:any) : any;

}