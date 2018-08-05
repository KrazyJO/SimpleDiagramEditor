//---------------------IMPORTS---------------------
import UpdateLabelHandler from './UpdateLabelHandler';
import * as LabelUtil from './LabelUtil';

//---------------------CONSTANTS---------------------
const MIN_BOUNDS = {
    width: 150,
    height: 30
};

//---------------------CLASS--------------------
export default class LabelEditingProvider {

  //---------------------CONSTRUCTOR---------------------
  constructor(eventBus, private canvas, directEditing, private commandStack) {
    directEditing.registerProvider(this);
    this.commandStack.registerHandler('element.updateLabel', UpdateLabelHandler);
    eventBus.on('element.dblclick', function (event) {
      directEditing.activate(event.element);
    });
    eventBus.on('connection.dblclick', function (event) {
      directEditing.activate(event.element);
    });
    eventBus.on(['element.mousedown', 'drag.activate', 'canvas.viewbox.changed'], function (event) {
      directEditing.complete();
    });
    eventBus.on(['commandStack.changed'], function () {
      directEditing.cancel();
    });
    eventBus.on('create.end', 500, function (e) {
      const element = e.shape;
      const canExecute = e.context.canExecute;
      if (!canExecute) {
        return;
      }
      directEditing.activate(element);
    });
  }

  //---------------------METHODS---------------------
  activate(element) : any {
    const text = LabelUtil.getLabel(element);
    if (text === undefined) {
      return;
    }
    const bbox = this.getEditingBBox(element);
    return {bounds: bbox, text: text};
  }

  getEditingBBox(element, maxBounds?) {
    const target = element.label || element;
    const bbox = this.canvas.getAbsoluteBBox(target);
    const mid = {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2
    };
    // external label
    bbox.width = Math.max(bbox.width, MIN_BOUNDS.width);
    bbox.height = Math.max(bbox.height, MIN_BOUNDS.height);
    bbox.x = mid.x - bbox.width / 2;
    if (target.businessObject.$instanceOf('sde:Edge')) {
      bbox.width = MIN_BOUNDS.width;
      bbox.height = MIN_BOUNDS.height;
      bbox.x = mid.x - bbox.width / 2;
      bbox.y = mid.y;
    }
    bbox.mid = mid;
    return bbox;
  }

  update(element, newLabel) {
    this.commandStack.execute('element.updateLabel', {
      element: element,
      newLabel: newLabel
    });
  }
}

(LabelEditingProvider as any).$inject = ['eventBus', 'canvas', 'directEditing', 'commandStack'];
