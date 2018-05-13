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
// import * as DiagramJS from 'diagram-js';
import Diagram from './diagram-ts/Diagram';
import { assign, omit } from 'lodash';
import { domify, query } from 'min-dom';
// import Ids = require('ids');
// import {Ids as Ids} from 'ids';
var Ids = require('ids');
import EasyModdle from './EasyModdle';
// import { importEasyDiagram } from './import/Importer';
//---------------------CONSTANTS---------------------
// const DEFAULT_PRIORITY = 1000;
var DEFAULT_OPTIONS = {
    width: '100%',
    height: '100%',
    position: 'relative',
};
var DEFAULT_MODULES = [
    // modules the viewer is composed of
    require('./diagram-ts/features/overlays'),
    require('./diagram-ts/features/selection'),
    // non-modeling components
    require('./diagram-ts/navigation/movecanvas'),
    require('./diagram-ts/navigation/touch'),
    require('./diagram-ts/navigation/zoomscroll'),
    // modeling components
    require('./draw'),
];
//---------------------CLASS--------------------
var Viewer = /** @class */ (function (_super) {
    __extends(Viewer, _super);
    //---------------------CONSTRUCTOR---------------------
    function Viewer(options, modules) {
        var _this = this;
        options = assign({}, DEFAULT_OPTIONS, options);
        _this = _super.call(this, options) || this;
        _this.modules = DEFAULT_MODULES.concat(modules);
        _this.moddle = _this.createModdle(options);
        _this.container = _this.createContainer(options);
        _this.init(_this.container, _this.moddle, options);
        return _this;
    }
    Viewer.prototype.getModules = function () {
        return this.modules;
    };
    Viewer.prototype.on = function (event, priority, callback, target) {
        return this.get('eventBus').on(event, priority, callback, target);
    };
    //---------------------METHODS---------------------
    Viewer.prototype.importXML = function (xml, done) {
        if (done === void 0) { done = function () { }; }
        var self = this;
        xml = this.emit('import.parse.start', { xml: xml }) || xml;
        console.log('Start Parsing!');
        this.moddle.fromXML(xml, 'ea:EasyGraph', {}, function (err, definitions, context) {
            console.log('Successfully parsed!');
            definitions = self.emit('import.parse.complete', {
                error: err,
                definitions: definitions,
                context: context
            }) || definitions;
            if (err) {
                err = this.checkValidationError(err);
                self.emit('import.done', { error: err });
                return done(err);
            }
            var parseWarnings = context.warnings;
            self.importDefinitions(definitions, function (err, importWarnings) {
                var allWarnings = [].concat(parseWarnings, importWarnings || []);
                self.emit('import.done', { error: err, warnings: allWarnings });
                done(err, allWarnings);
            });
        });
    };
    Viewer.prototype.importDefinitions = function (definitions, done) {
        try {
            if (this.definitions) {
                this.clear();
            }
            this.definitions = definitions;
            // Attention, this done need to be removed after import is implemented!!!
            done();
            // importEasyDiagram(this, definitions, done);
        }
        catch (e) {
            done(e);
        }
    };
    Viewer.prototype.init = function (container, moddle, options) {
        var baseModules = options.modules || this.getModules();
        var additionalModules = options.additionalModules || [];
        var staticModules = [
            {
                moddle: ['value', moddle]
            }
        ];
        var diagramModules = staticModules.concat(baseModules, additionalModules);
        var diagramOptions = assign(omit(options, 'additionalModules'), {
            canvas: assign({}, options.canvas, { container: container }),
            modules: diagramModules
        });
        // invoke diagram constructor
        // DiagramJS.call(this, diagramOptions);
        Diagram.call(this, diagramOptions);
        if (options && options.container) {
            this.attachTo(options.container);
        }
    };
    Viewer.prototype.emit = function (type, event) {
        return this.get('eventBus').fire(type, event);
    };
    Viewer.prototype.createModdle = function (options) {
        this.modules = DEFAULT_MODULES;
        var moddle = new EasyModdle(options.moddleExtensions);
        moddle.ids = new Ids([32, 36, 1]);
        return moddle;
    };
    Viewer.prototype.createContainer = function (options) {
        var container = domify('<div class="diagram-container"></div>');
        assign(container.style, {
            width: options.width,
            height: options.height,
            position: options.position
        });
        return container;
    };
    Viewer.prototype.attachTo = function (parentNode) {
        if (!parentNode) {
            throw new Error('parentNode required');
        }
        // ensure we detach from the
        // previous, old parent
        this.detach();
        // unwrap jQuery if provided
        if (parentNode.get && parentNode.constructor.prototype.jquery) {
            parentNode = parentNode.get(0);
        }
        if (typeof parentNode === 'string') {
            parentNode = query(parentNode);
        }
        parentNode.appendChild(this.container);
        this.emit('attach', {});
        this.get('canvas').resized();
    };
    Viewer.prototype.detach = function () {
        var parentNode = this.container.parentNode;
        if (!parentNode) {
            return;
        }
        this.emit('detach', {});
        parentNode.removeChild(this.container);
    };
    Viewer.prototype.collectIds = function (definitions, context) {
        var moddle = definitions.$model;
        var ids = moddle.ids;
        ids.clear();
        for (var _i = 0, _a = context.elementsById; _i < _a.length; _i++) {
            var id = _a[_i];
            ids.claim(id, context.elementsById[id]);
        }
    };
    return Viewer;
}(Diagram));
export { Viewer };
//# sourceMappingURL=Viewer.js.map