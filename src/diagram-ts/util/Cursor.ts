// import {
// 	classes as domClasses
// } from 'min-dom';

const {
	classes
} = require('min-dom');

var CURSOR_CLS_PATTERN = /^djs-cursor-.*$/;


export function set(mode: any) {
	var classes2 = classes(document.body);

	classes2.removeMatching(CURSOR_CLS_PATTERN);

	if (mode) {
		classes2.add('djs-cursor-' + mode);
	}
}

export function unset() {
	set(null);
}

export function has(mode: any) {
	var classes2 = classes(document.body);

	return classes2.has('djs-cursor-' + mode);
}
