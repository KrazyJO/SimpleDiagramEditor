import { forEach } from 'min-dash';

import {
  Base
} from '../../model';

import AppendShapeHandler from './cmd/AppendShapeHandler';
import CreateShapeHandler from './cmd/CreateShapeHandler';
import DeleteShapeHandler from './cmd/DeleteShapeHandler';
import MoveShapeHandler from './cmd/MoveShapeHandler';
import ResizeShapeHandler from './cmd/ResizeShapeHandler';
import ReplaceShapeHandler from './cmd/ReplaceShapeHandler';
import ToggleShapeCollapseHandler from './cmd/ToggleShapeCollapseHandler';
import SpaceToolHandler from './cmd/SpaceToolHandler';
import CreateLabelHandler from './cmd/CreateLabelHandler';
import CreateConnectionHandler from './cmd/CreateConnectionHandler';
import DeleteConnectionHandler from './cmd/DeleteConnectionHandler';
import MoveConnectionHandler from './cmd/MoveConnectionHandler';
import LayoutConnectionHandler from './cmd/LayoutConnectionHandler';
import UpdateWaypointsHandler from './cmd/UpdateWaypointsHandler';
import ReconnectConnectionHandler from './cmd/ReconnectConnectionHandler';
import MoveElementsHandler from './cmd/MoveElementsHandler';
import DeleteElementsHandler from './cmd/DeleteElementsHandler';
import DistributeElementsHandler from './cmd/DistributeElementsHandler';
import AlignElementsHandler from './cmd/AlignElementsHandler';
import UpdateAttachmentHandler from './cmd/UpdateAttachmentHandler';
import PasteHandler from './cmd/PasteHandler';
import EventBus from '../../core/EventBus';
import ElementFactory from '../../core/ElementFactory';
import CommandStack from '../../command/CommandStack';
import { Point, hints, Bounds } from '../../interfaces';


/**
 * The basic modeling entry point.
 *
 * @param {EventBus} eventBus
 * @param {ElementFactory} elementFactory
 * @param {CommandStack} commandStack
 */
export default class Modeling {

  public $inject = [ 'eventBus', 'elementFactory', 'commandStack' ];

  public _eventBus : EventBus;
  private _elementFactory : ElementFactory;
  private _commandStack : CommandStack;

  constructor(eventBus : EventBus, elementFactory : ElementFactory, commandStack : CommandStack) {
	this._eventBus = eventBus;
	this._elementFactory = elementFactory;
	this._commandStack = commandStack;
  
	var self = this;
  
	eventBus.on('diagram.init', function() {
	  // register modeling handlers
	  self.registerHandlers(commandStack);
	});
  }

  getHandlers() {
	return {
	  'shape.append': AppendShapeHandler,
	  'shape.create': CreateShapeHandler,
	  'shape.delete': DeleteShapeHandler,
	  'shape.move': MoveShapeHandler,
	  'shape.resize': ResizeShapeHandler,
	  'shape.replace': ReplaceShapeHandler,
	  'shape.toggleCollapse': ToggleShapeCollapseHandler,
  
	  'spaceTool': SpaceToolHandler,
  
	  'label.create': CreateLabelHandler,
  
	  'connection.create': CreateConnectionHandler,
	  'connection.delete': DeleteConnectionHandler,
	  'connection.move': MoveConnectionHandler,
	  'connection.layout': LayoutConnectionHandler,
  
	  'connection.updateWaypoints': UpdateWaypointsHandler,
  
	  'connection.reconnectStart': ReconnectConnectionHandler,
	  'connection.reconnectEnd': ReconnectConnectionHandler,
  
	  'elements.move': MoveElementsHandler,
	  'elements.delete': DeleteElementsHandler,
  
	  'elements.distribute': DistributeElementsHandler,
	  'elements.align': AlignElementsHandler,
  
	  'element.updateAttachment': UpdateAttachmentHandler,
  
	  'elements.paste': PasteHandler
	};
  };
  
  /**
   * Register handlers with the command stack
   *
   * @param {CommandStack} commandStack
   */
  public registerHandlers(commandStack : CommandStack) : void {
	forEach(this.getHandlers(), function(handler : any, id : any) {
	  commandStack.registerHandler(id, handler);
	});
  };
  
  
  // modeling helpers //////////////////////
  
  public moveShape(shape : any, delta : any, newParent : any, newParentIndex? : any, hints? : any) {
  
	if (typeof newParentIndex === 'object') {
	  hints = newParentIndex;
	  newParentIndex = null;
	}
  
	var context = {
	  shape: shape,
	  delta:  delta,
	  newParent: newParent,
	  newParentIndex: newParentIndex,
	  hints: hints || {}
	};
  
	this._commandStack.execute('shape.move', context);
  };
  
  
  /**
   * Update the attachment of the given shape.
   *
   * @param {djs.mode.Base} shape
   * @param {djs.model.Base} [newHost]
   */
  public updateAttachment(shape : any, newHost : any) {
	var context = {
	  shape: shape,
	  newHost: newHost
	};
  
	this._commandStack.execute('element.updateAttachment', context);
  };
  
  
  /**
   * Move a number of shapes to a new target, either setting it as
   * the new parent or attaching it.
   *
   * @param {Array<djs.mode.Base>} shapes
   * @param {Point} delta
   * @param {djs.model.Base} [target]
   * @param {Object} [hints]
   * @param {Boolean} [hints.attach=false]
   */
  public moveElements(shapes : any, delta : Point, target : any, hints? : any) {
  
	hints = hints || {};
  
	var attach = hints.attach;
  
	var newParent = target,
		newHost;
  
	if (attach === true) {
	  newHost = target;
	  newParent = target.parent;
	} else
  
	if (attach === false) {
	  newHost = null;
	}
  
	var context = {
	  shapes: shapes,
	  delta: delta,
	  newParent: newParent,
	  newHost: newHost,
	  hints: hints
	};
  
	this._commandStack.execute('elements.move', context);
  };
  
  
  public moveConnection(connection : any, delta : Point, newParent : any, newParentIndex? : any, hints? : hints) : void{
  
	if (typeof newParentIndex === 'object') {
	  hints = newParentIndex;
	  newParentIndex = undefined;
	}
  
	var context = {
	  connection: connection,
	  delta: delta,
	  newParent: newParent,
	  newParentIndex: newParentIndex,
	  hints: hints || {}
	};
  
	this._commandStack.execute('connection.move', context);
  };
  
  
  public layoutConnection(connection : any, hints : any) : void{
	var context = {
	  connection: connection,
	  hints: hints || {}
	};
  
	this._commandStack.execute('connection.layout', context);
  };
  
  
  /**
   * Create connection.
   *
   * @param {djs.model.Base} source
   * @param {djs.model.Base} target
   * @param {Number} [targetIndex]
   * @param {Object|djs.model.Connection} connection
   * @param {djs.model.Base} parent
   * @param {Object} hints
   *
   * @return {djs.model.Connection} the created connection.
   */
  public createConnection(source : any, target : any, parentIndex : number, connection : any, parent? : any, hints? : hints) : any {
  
	if (typeof parentIndex === 'object') {
	  hints = parent;
	  parent = connection;
	  connection = parentIndex;
	  parentIndex = undefined;
	}
  
	connection = this._create('connection', connection);
  
	var context = {
	  source: source,
	  target: target,
	  parent: parent,
	  parentIndex: parentIndex,
	  connection: connection,
	  hints: hints
	};
  
	this._commandStack.execute('connection.create', context);
  
	return context.connection;
  };
  
  
  /**
   * Create a shape at the specified position.
   *
   * @param {djs.model.Shape|Object} shape
   * @param {Point} position
   * @param {djs.model.Shape|djs.model.Root} target
   * @param {Number} [parentIndex] position in parents children list
   * @param {Object} [hints]
   * @param {Boolean} [hints.attach] whether to attach to target or become a child
   *
   * @return {djs.model.Shape} the created shape
   */
  public createShape(shape : any, position : Point, target : any, parentIndex? : number | object, hints? : any)  : any{
  
	if (typeof parentIndex !== 'number') {
	  hints = parentIndex;
	  parentIndex = undefined;
	}
  
	hints = hints || {};
  
	var attach = hints.attach,
		parent,
		host;
  
	shape = this._create('shape', shape);
  
	if (attach) {
	  parent = target.parent;
	  host = target;
	} else {
	  parent = target;
	}
  
	var context = {
	  position: position,
	  shape: shape,
	  parent: parent,
	  parentIndex: parentIndex,
	  host: host,
	  hints: hints
	};
  
	this._commandStack.execute('shape.create', context);
  
	return context.shape;
  };
  
  
  public createLabel(labelTarget : any, position : any, label : any, parent : any) : any {
  
	label = this._create('label', label);
  
	var context = {
	  labelTarget: labelTarget,
	  position: position,
	  parent: parent || labelTarget.parent,
	  shape: label
	};
  
	this._commandStack.execute('label.create', context);
  
	return context.shape;
  };
  
  
  /**
   * Append shape to given source, drawing a connection
   * between source and the newly created shape.
   *
   * @param {djs.model.Shape} source
   * @param {djs.model.Shape|Object} shape
   * @param {Point} position
   * @param {djs.model.Shape} target
   * @param {Object} [hints]
   * @param {Boolean} [hints.attach]
   * @param {djs.model.Connection|Object} [hints.connection]
   * @param {djs.model.Base} [hints.connectionParent]
   *
   * @return {djs.model.Shape} the newly created shape
   */
  public appendShape(source : any, shape : any, position : Point, target : any, hints : any) : any {
  
	hints = hints || {};
  
	shape = this._create('shape', shape);
  
	var context = {
	  source: source,
	  position: position,
	  target: target,
	  shape: shape,
	  connection: hints.connection,
	  connectionParent: hints.connectionParent,
	  attach: hints.attach
	};
  
	this._commandStack.execute('shape.append', context);
  
	return context.shape;
  };
  
  
  public removeElements(elements : any) : void {
	var context = {
	  elements: elements
	};
  
	this._commandStack.execute('elements.delete', context);
  };
  
  
  public distributeElements(groups : any, axis : any, dimension : any) : void {
	var context = {
	  groups: groups,
	  axis: axis,
	  dimension: dimension
	};
  
	this._commandStack.execute('elements.distribute', context);
  };
  
  
  public removeShape(shape : any, hints? : any) : void {
	var context = {
	  shape: shape,
	  hints: hints || {}
	};
  
	this._commandStack.execute('shape.delete', context);
  };
  
  
  public removeConnection(connection : any, hints? : any) : void {
	var context = {
	  connection: connection,
	  hints: hints || {}
	};
  
	this._commandStack.execute('connection.delete', context);
  };
  
  public replaceShape(oldShape : any, newShape : any, hints : any) : any {
	var context : any = {
	  oldShape: oldShape,
	  newData: newShape,
	  hints: hints || {}
	};
  
	this._commandStack.execute('shape.replace', context);
  
	return context.newShape;
  };
  
  public pasteElements(tree : any, topParent : any, position : Point) : void{
	var context = {
	  tree: tree,
	  topParent: topParent,
	  position: position
	};
  
	this._commandStack.execute('elements.paste', context);
  };
  
  public alignElements(elements : any, alignment : any) : void {
	var context = {
	  elements: elements,
	  alignment: alignment
	};
  
	this._commandStack.execute('elements.align', context);
  };
  
  public resizeShape(shape : any, newBounds : Bounds, minBounds? : Bounds) {
	var context = {
	  shape: shape,
	  newBounds: newBounds,
	  minBounds: minBounds
	};
  
	this._commandStack.execute('shape.resize', context);
  };
  
  public createSpace(movingShapes : any, resizingShapes : any, delta : any, direction : any) : void {
	var context = {
	  movingShapes: movingShapes,
	  resizingShapes: resizingShapes,
	  delta: delta,
	  direction: direction
	};
  
	this._commandStack.execute('spaceTool', context);
  };
  
  public updateWaypoints(connection : any, newWaypoints : any, hints : any) : void {
	var context = {
	  connection: connection,
	  newWaypoints: newWaypoints,
	  hints: hints || {}
	};
  
	this._commandStack.execute('connection.updateWaypoints', context);
  };
  
  public reconnectStart(connection : any, newSource : any, dockingOrPoints : any) : void {
	var context = {
	  connection: connection,
	  newSource: newSource,
	  dockingOrPoints: dockingOrPoints
	};
  
	this._commandStack.execute('connection.reconnectStart', context);
  };
  
  public reconnectEnd(connection : any, newTarget : any, dockingOrPoints : any) : void {
	var context = {
	  connection: connection,
	  newTarget: newTarget,
	  dockingOrPoints: dockingOrPoints
	};
  
	this._commandStack.execute('connection.reconnectEnd', context);
  };
  
  public connect(source : any, target : any, attrs : any, hints : any) : any {
	return this.createConnection(source, target, attrs || {}, source.parent, hints);
  };
  
  private _create(type : any, attrs : any) : any {
	if (attrs instanceof Base) {
	  return attrs;
	} else {
	  return this._elementFactory.create(type, attrs);
	}
  };
  
  public toggleCollapse(shape : any, hints : any) : void {
	var context = {
	  shape: shape,
	  hints: hints || {}
	};
  
	this._commandStack.execute('shape.toggleCollapse', context);
  };
  

  
}