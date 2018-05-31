//---------------------IMPORTS---------------------
import { assign, map, pick } from 'lodash';

//---------------------CLASS--------------------
export default class EasyFactory {

	//---------------------CONSTRUCTOR---------------------
	constructor(private moddle) { }

	//---------------------METHODS---------------------
	create(type: string, attrs) {
		let element = this.moddle.create(type, attrs || {});
		this.ensureId(element);
		return element;
	}

	createDiShape(semantic, bounds, attrs) {
		return this.create('sdedi:EasyShape', assign({
			easyElement: semantic,
			bounds: this.createDiBounds(bounds)
		}, attrs));
	}

	createDiBounds(bounds?) {
		return this.create('dc:Bounds', bounds);
	}

	createDiWaypoints(waypoints) {
		let self = this;
		return map(waypoints, function (pos) {
			return self.createDiWaypoint(pos);
		});
	}

	createDiWaypoint(point) {
		return this.create('dc:Point', pick(point, ['x', 'y']));
	}

	createDiEdge(semantic, waypoints, attrs) {
		return this.create('sdedi:EasyEdge', assign({
			easyElement: semantic
		}, attrs));
	}

	private ensureId(element) {
		const prefix = (element.$type || '').replace(/^[^:]*:/g, '') + '_';
		if (!element.id) {
			element.id = this.moddle.ids.nextPrefixed(prefix, element);
		}
	}
}

(EasyFactory as any).$inject = ['moddle'];
