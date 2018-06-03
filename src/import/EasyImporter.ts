//---------------------IMPORTS---------------------
import { assign, map } from 'lodash';

//---------------------STATIC---------------------
function elementData(semantic, attrs?) {
  return assign({
    id: semantic.id,
    type: semantic.$type,
    businessObject: semantic
  }, attrs);
}

type Point = {
  x: number|string,
  y: number|string
};

function collectWaypoints(waypoints) {
  return map(waypoints, function(p: Point) {
    return { x: p.x, y: p.y };
  });
}

//---------------------CLASS--------------------
export default class EasyImporter {

  //---------------------CONSTRUCTOR---------------------
  constructor(private eventBus, private canvas, private elementFactory, private elementRegistry) { }

  //---------------------METHODS---------------------
  root(diagram) {
    const element = this.elementFactory.createRoot(elementData(diagram));
    this.canvas.setRootElement(element);
    return element;
  }

  add(businessObject, parentElement) {
    const di = businessObject.di;
    let element;
    if (di && di.$instanceOf('sdedi:SimpleDebugEditorShape')) {
      const bounds = businessObject.di.bounds;
      element = this.elementFactory.createShape(elementData(businessObject, {
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height)
      }));
      this.canvas.addShape(element, parentElement);
    }
    else if (di && di.$instanceOf('sdedi:SimpleDebugEditorEdge')) {
      const source = this.getSource(businessObject);
      const target = this.getTarget(businessObject);
      element = this.elementFactory.createConnection(elementData(businessObject, {
        source: source,
        target: target,
        waypoints: collectWaypoints(businessObject.di.waypoint)
      }));
      this.canvas.addConnection(element, parentElement);
    } else {
      throw new Error('unknown di');
    }
    // this.eventBus.fire('easyElement.added', { element: element });
    this.eventBus.fire('simpleDebugEditorElement.added', { element: element });
    return element;
  }

  private getSource(connection) {
    if (connection.$instanceOf('sde:Edge')) {
      const sourceRes = connection.sourceNode;
      return this.elementRegistry.get(sourceRes.id);
    } 
  }

  private getTarget(connection) {
    if (connection.$instanceOf('sde:Edge')) {
      const targetRes = connection.targetNode;
      return this.elementRegistry.get(targetRes.id);
    }
  }
}

(EasyImporter as any).$inject = [ 'eventBus', 'canvas', 'elementFactory', 'elementRegistry' ];
