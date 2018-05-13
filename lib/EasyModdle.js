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
//---------------------IMPORTS---------------------
import { assign } from 'lodash';
import { Reader as XMLReader, Writer as XMLWriter } from 'moddle-xml';
import * as Moddle from 'moddle';
// const Ids = require('ids');
//---------------------CONSTANTS---------------------
var DEFAULT_PACKAGES = [
    require('../resources/easy.json'),
    require('../resources/easydi.json'),
    require('../resources/dc.json'),
    require('../resources/di.json')
];
//---------------------CLASS--------------------
var EasyModdle = /** @class */ (function (_super) {
    __extends(EasyModdle, _super);
    //---------------------CONSTRUCTOR---------------------
    function EasyModdle(packages) {
        if (packages === void 0) { packages = DEFAULT_PACKAGES; }
        return _super.call(this, packages) || this;
    }
    //---------------------METHODS---------------------
    EasyModdle.prototype.fromXML = function (xmlStr, typeName, options, done) {
        if (typeName === void 0) { typeName = 'ea:EasyGraph'; }
        if (options === void 0) { options = {}; }
        if (done === void 0) { done = function () { }; }
        var reader = new XMLReader(assign({ model: this, lax: true }, options));
        var rootHandler = reader.handler(typeName);
        reader.fromXML(xmlStr, rootHandler, done);
    };
    EasyModdle.prototype.toXML = function (element, options, done) {
        if (options === void 0) { options = {}; }
        if (done === void 0) { done = function () { }; }
        var writer = new XMLWriter(options);
        try {
            var result = writer.toXML(element);
            done(null, result);
        }
        catch (e) {
            done(e);
        }
    };
    return EasyModdle;
}(Moddle));
export default EasyModdle;
//# sourceMappingURL=EasyModdle.js.map