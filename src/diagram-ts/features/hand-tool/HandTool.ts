import { hasPrimaryModifier } from '../../util/Mouse';
import ToolManager from '../tool-manager/ToolManager';
import Dragging from '../dragging/Dragging';
import Canvas from '../../core/Canvas';
import EventBus from '../../core/EventBus';

var HIGH_PRIORITY = 1500;
var HAND_CURSOR = 'grab';


export default class HandTool {

  public static $inject = [
	'eventBus',
	'canvas',
	'dragging',
	'toolManager'
  ];

  private _dragging : Dragging;

  constructor(eventBus: EventBus, canvas: Canvas, dragging: Dragging, toolManager: ToolManager) {
	this._dragging = dragging;


	toolManager.registerTool('hand', {
	  tool: 'hand',
	  dragging: 'hand.move'
	});
  
	eventBus.on('element.mousedown', HIGH_PRIORITY, function(event) : any{
	  if (hasPrimaryModifier(event)) {
		this.activateMove(event.originalEvent);
  
		return false;
	  }
	}, this);
  
  
	eventBus.on('hand.end', function(event) : any {
	  var target = event.originalEvent.target;
  
	  // only reactive on diagram click
	  // on some occasions, event.hover is not set and we have to check if the target is an svg
	  if (!event.hover && !(target instanceof SVGElement)) {
		return false;
	  }
  
	  eventBus.once('hand.ended', function() {
		this.activateMove(event.originalEvent, { reactivate: true });
	  }, this);
  
	}, this);
  
  
	eventBus.on('hand.move.move', function(event) {
	  var scale = canvas.viewbox().scale;
  
	  canvas.scroll({
		dx: event.dx * scale,
		dy: event.dy * scale
	  });
	});
  
	eventBus.on('hand.move.end', function(event) {
	  var context = event.context,
		  reactivate = context.reactivate;
  
	  // Don't reactivate if the user is using the keyboard keybinding
	  if (!hasPrimaryModifier(event) && reactivate) {
  
		eventBus.once('hand.move.ended', function(event) {
		  this.activateHand(event.originalEvent, true, true);
		}, this);
  
	  }
  
	  return false;
	}, this);
  }
  
  public activateMove(event, autoActivate, context) {
	if (typeof autoActivate === 'object') {
	  context = autoActivate;
	  autoActivate = false;
	}
  
	this._dragging.init(event, 'hand.move', {
	  autoActivate: autoActivate,
	  cursor: HAND_CURSOR,
	  data: {
		context: context || {}
	  }
	});
  };
  
  public activateHand(event?, autoActivate?, reactivate?) {
	this._dragging.init(event, 'hand', {
	  trapClick: false,
	  autoActivate: autoActivate,
	  cursor: HAND_CURSOR,
	  data: {
		context: {
		  reactivate: reactivate
		}
	  }
	});
  };
  
  public toggle() {
	if (this.isActive()) {
	  this._dragging.cancel();
	} else {
	  this.activateHand();
	}
  };
  
  public isActive() {
	var context = this._dragging.context();
  
	return context && /^hand/.test(context.prefix);
  };

}

// HandTool.$inject = [
//   'eventBus',
//   'canvas',
//   'dragging',
//   'toolManager'
// ];



