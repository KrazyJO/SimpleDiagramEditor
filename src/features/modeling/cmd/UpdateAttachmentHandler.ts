import {
  add as collectionAdd,
  remove as collectionRemove
} from '../../../util/Collections';
import Modeling from '../Modeling';

/**
 * A handler that implements reversible attaching/detaching of shapes.
 */
export default class UpdateAttachmentHandler {
  
	public _modeling : Modeling;
	public static $inject = [ 'modeling' ];

	constructor(modeling : Modeling) {
	  this._modeling = modeling;
  }

  public execute(context : any) {
	var shape = context.shape,
		newHost = context.newHost,
		oldHost = shape.host;
  
	// (0) detach from old host
	context.oldHost = oldHost;
	context.attacherIdx = removeAttacher(oldHost, shape);
  
	// (1) attach to new host
	addAttacher(newHost, shape);
  
	// (2) update host
	shape.host = newHost;
  
	return shape;
  };
  
  public revert(context : any) {
	var shape = context.shape,
		newHost = context.newHost,
		oldHost = context.oldHost,
		attacherIdx = context.attacherIdx;
  
	// (2) update host
	shape.host = oldHost;
  
	// (1) attach to new host
	removeAttacher(newHost, shape);
  
	// (0) detach from old host
	addAttacher(oldHost, shape, attacherIdx);
  
	return shape;
  };
}


function removeAttacher(host : any, attacher : any) {
  // remove attacher from host
  return collectionRemove(host && host.attachers, attacher);
}

function addAttacher(host : any, attacher : any, idx? : number) {

  if (!host) {
    return;
  }

  var attachers = host.attachers;

  if (!attachers) {
    host.attachers = attachers = [];
  }

  collectionAdd(attachers, attacher, idx);
}
