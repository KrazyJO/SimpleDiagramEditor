//---------------------IMPORTS---------------------
import { assign } from 'lodash';
// import { getBusinessObject, is } from '../../utils/ModelUtil';
import { getBusinessObject, is } from '@utils/ModelUtil';
// import * as Collections from 'diagram-js/lib/util/Collections';
import * as Collections from '../../diagram-ts/util/Collections';
// import CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');
import CommandInterceptor from '../../diagram-ts/command/CommandInterceptor';

//---------------------CLASS--------------------
export default class EasyUpdater extends CommandInterceptor {

  //---------------------CONSTRUCTOR---------------------
  constructor(eventBus, private easyFactory, connectionDocking) {
    super(eventBus);
    const cropConnection = (e) => {
      const context = e.context;
      if (!context.cropped) {
        const connection = context.connection;
        connection.waypoints = connectionDocking.getCroppedWaypoints(connection);
        context.cropped = true;
      }
    };
    super.on([
      'connection.layout',
      'connection.create',
      'connection.reconnectEnd',
      'connection.reconnectStart'
    ], 'executed', cropConnection);
    super.on(['connection.layout'], 'reverted', (e) => delete e.context.cropped);
    const updateConnection = (e) => {
      const context = e.context;
      this.updateConnection(context);
    };
    // update connection
    this.on([
      'connection.create',
      'connection.move',
      'connection.delete',
      'connection.reconnectEnd',
      'connection.reconnectStart'], 'executed', updateConnection);
    this.on([
      'connection.create',
      'connection.move',
      'connection.delete',
      'connection.reconnectEnd',
      'connection.reconnectStart'], 'reverted', updateConnection);
    const updateConnectionWaypoints = (e) => {
      if (e.context.connection) {
        this.updateConnectionWaypoints(e.context.connection);
      }
      if (e.context.shape) {
        for (let con of e.context.shape.incoming) {
          this.updateConnectionWaypoints(con);
        }
        for (let con of e.context.shape.outgoing) {
          this.updateConnectionWaypoints(con);
        }
      }
    };
    // update waypoints
    this.on(['shape.move',
      'connection.layout',
      'connection.move',
      'connection.updateWaypoints',
      'connection.reconnectEnd',
      'connection.reconnectStart'], 'executed', updateConnectionWaypoints);
    this.on(['shape.move',
      'connection.layout',
      'connection.move',
      'connection.updateWaypoints',
      'connection.reconnectEnd',
      'connection.reconnectStart'], 'reverted', updateConnectionWaypoints);
    // update parent
    const updateParent = (e) => {
      const context = e.context;
      this.updateParent(context.shape || context.connection, context.oldParent);
    };
    const reverseUpdateParent = (e) => {
      const context = e.context;
      const element = context.shape || context.connection;
      const oldParent = context.parent || context.newParent;
      this.updateParent(element, oldParent);
    };
    this.on(['shape.move',
      'shape.create',
      'shape.delete'], 'executed', updateParent);
    this.on(['shape.move',
      'shape.create',
      'shape.delete'], 'reverted', reverseUpdateParent);
    // update bounds
    const updateBounds = (e) => {
      const shape = e.context.shape;
      this.updateBounds(shape);
    };
    this.on([
      'shape.move',
      'shape.create',
      'shape.resize'], 'executed', updateBounds);
    this.on([
      'shape.move',
      'shape.create',
      'shape.resize'], 'reverted', updateBounds);
  }

  //---------------------METHODS---------------------
  updateConnection(context) {
    const connection = context.connection;
    const businessObject = getBusinessObject(connection);
    const newSource = getBusinessObject(connection.source);
    const newTarget = getBusinessObject(connection.target);
    if (is(businessObject, 'ea:Edge')) {
      if (newSource && newTarget) {
        if (!businessObject.$parent || !businessObject.di.$parent) {
          const rootShape = this.getRootFromElement(connection);
          const parentBO = this.getModel(rootShape);
          businessObject.$parent = this.getModel(rootShape);
          parentBO.get('myEdges').push(businessObject);
        }
        const modelRoot = this.getModelRootFromBo(businessObject);
        const parentDI = this.getCurrentRootDIContainer(modelRoot);
        this.updateParentDI(businessObject.di, parentDI);
        businessObject.tgt = newTarget;
        businessObject.src = newSource;
      } else {
        this.updateParentDI(businessObject.di);
        this.updateParentBusinessObject(businessObject);
      }
    }
    this.updateConnectionWaypoints(connection);
  }

  updateConnectionWaypoints(connection) {
    connection.businessObject.di.set('waypoint', this.easyFactory.createDiWaypoints(connection.waypoints));
  }

  getRootFromElement(el) {
    if (el.parent) {
      return this.getRootFromElement(el.parent);
    }
    return el;
  }

  getModelRootFromBo(bo) {
    if (bo.$parent) {
      return this.getModelRootFromBo(bo.$parent);
    }
    return bo;
  }

  getModel(rootShape) {
    // returns the root bo from first child with a businessObject
    for (let i = 0; i < rootShape.children.length; i++) {
      if (rootShape.children[i].businessObject) {
        return this.getModelRootFromBo(rootShape.children[i].businessObject);
      }
    }
  }

  getCurrentRootDIContainer(modelRoot) {
    return modelRoot.EasyDiagram;
  }

  updateBounds(shape) {
    const di = shape.businessObject.di;
    const bounds = di.bounds;
    assign(bounds, {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height
    });
  }

  updateParent(element, oldParent) {
    const parentShape = element.parent;
    let businessObject = getBusinessObject(element);
    let parentBusinessObject = getBusinessObject(element.parent);
    let parentDi = parentBusinessObject && parentBusinessObject.di;
    if (is(parentBusinessObject, 'eadi:EasyDiagram')) {
      parentDi = parentBusinessObject;
    }
    if (!parentBusinessObject && parentShape) {
      parentBusinessObject = this.getModel(parentShape);
      parentDi = this.getCurrentRootDIContainer(parentBusinessObject);
    }
    if (is(businessObject, 'ea:Node')) {
      this.updateParentBusinessObject(businessObject, parentBusinessObject);
    }
    this.updateParentDI(businessObject.di, parentDi);
  }

  updateParentBusinessObject(businessObject, newParentBusinessObject?) {
    const oldParentBusinessObject = businessObject.$parent;
    let containment;
    if (oldParentBusinessObject === newParentBusinessObject) {
      return;
    }
    if (newParentBusinessObject) {
      if (is(newParentBusinessObject, 'ea:EasyGraph')) {
        if (is(businessObject, 'ea:Node')) {
          containment = 'myNodes';
        }
      } else if (is(newParentBusinessObject, 'eadi:EasyDiagram')) {
        newParentBusinessObject = this.getModelRootFromBo(newParentBusinessObject);
        if (is(businessObject, 'ea:Node')) {
          containment = 'myNodes';
        }
      }
      newParentBusinessObject.get(containment).push(businessObject);
      businessObject.$parent = newParentBusinessObject;
    } else {
      businessObject.$parent = null;
    }
    if (oldParentBusinessObject) {
      if (is(businessObject, 'ea:Node')) {
        containment = 'myNodes';
      }
      Collections.remove(oldParentBusinessObject.get(containment), businessObject);
    }
  }

  updateParentDI(di, newParentDi?) {
    const oldParentDi = di.$parent;
    if (oldParentDi === newParentDi) {
      return;
    }
    // add to new parent
    if (newParentDi) {
      if (newParentDi.$type === 'eadi:EasyDiagram') {
        newParentDi.get('diagramElements').push(di);
      } else if (newParentDi.$type === 'eadi:EasyShape') {
        newParentDi.get('easyElement').push(di);
      } else {
        di.$parent = null;
      }
      // remove from old parent
      if (oldParentDi) {
        if (oldParentDi.$type === 'eadi:EasyDiagram') {
          Collections.remove(oldParentDi.get('diagramElements'), di);
        }
        else if (oldParentDi.$type === 'eadi:EasyShape') {
          Collections.remove(oldParentDi.get('easyElement'), di);
        }
      }
    }
  }
}

(EasyUpdater as any).$inject = ['eventBus', 'easyFactory', 'connectionDocking'];
