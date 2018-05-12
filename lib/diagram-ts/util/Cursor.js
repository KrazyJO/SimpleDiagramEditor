// import {
// 	classes as domClasses
// } from 'min-dom';
var classes = require('min-dom').classes;
var CURSOR_CLS_PATTERN = /^djs-cursor-.*$/;
export function set(mode) {
    var classes2 = classes(document.body);
    classes2.removeMatching(CURSOR_CLS_PATTERN);
    if (mode) {
        classes2.add('djs-cursor-' + mode);
    }
}
export function unset() {
    set(null);
}
export function has(mode) {
    var classes2 = classes(document.body);
    return classes2.has('djs-cursor-' + mode);
}
//# sourceMappingURL=Cursor.js.map