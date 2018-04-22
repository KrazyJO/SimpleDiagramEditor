export interface hints {
	preserveDocking : string, 
	preferredLayouts : string[],
	connectionStart : boolean | Point,
	connectionEnd : boolean	| Point	
}

export interface Bounds {
	x : number,
	y: number,
	width : number,
	height : number
}

export interface Point {
	original? : Point
	x : number,
	y : number
	}
	
export interface Range {
	min : number,
	max : number
}