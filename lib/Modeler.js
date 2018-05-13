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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
//---------------------IMPORTS---------------------
import { Viewer } from './Viewer';
//---------------------CONSTANTS---------------------
var DEFAULT_PRIORITY = 1000;
var DEFAULT_OPTIONS = {
    width: '100%',
    height: '100%',
    position: 'relative',
    container: 'body'
};
var DEFAULT_MODULES = [
    // modeling components
    require('./diagram-ts/features/auto-scroll'),
    require('./diagram-ts/features/hand-tool'),
    require('./diagram-ts/features/lasso-tool'),
    require('./diagram-ts/features/move'),
];
//---------------------CLASS--------------------
var Modeler = /** @class */ (function (_super) {
    __extends(Modeler, _super);
    //---------------------CONSTRUCTOR---------------------
    function Modeler(options) {
        var _this = this;
        options = __assign({}, DEFAULT_OPTIONS, options);
        _this = _super.call(this, options, DEFAULT_MODULES) || this;
        _this.on('import.parse.complete', DEFAULT_PRIORITY, function (event) {
            if (!event.error) {
                _this.collectIds(event.definitions, event.context);
            }
        }, _this);
        _this.on('diagram.destroy', DEFAULT_PRIORITY, function () {
            _this.moddle.ids.clear();
        }, _this);
        return _this;
    }
    return Modeler;
}(Viewer));
export { Modeler };
//# sourceMappingURL=Modeler.js.map