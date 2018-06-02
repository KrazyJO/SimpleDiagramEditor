//---------------------IMPORTS---------------------
import Snapping = require('../../diagram-ts/features/snapping/Snapping');
import SnapUtil = require('../../diagram-ts/features/snapping/SnapUtil');
// import SnapContext = require('../../diagram-ts/features/snapping/SnapContext');
// import { is } from '@utils/ModelUtil';
// import { asTRBL } from 'diagram-js/lib/layout/LayoutUtil';
import { snapTo } from '@utils/SvgUtil';

//---------------------CLASS--------------------
export default class EasySnapping extends Snapping {

	//---------------------CONSTRUCTOR---------------------
	constructor(eventBus, canvas) {
		super(eventBus, canvas);
		eventBus.on('resize.start', 1501, function (event) {
			const context = event.context;
			context.minDimensions = { width: 10, height: 10 };
		});
		eventBus.on('drag.end', e => {
			const drag = snapTo(e.x, e.y);
			e.x = drag.x;
			e.y = drag.y;
		});
	}

	//---------------------METHODS---------------------
	addTargetSnaps(snapPoints, shape, target) {
		const siblings = this.getSiblings(shape, target) || [];
		siblings.forEach(sibling => {
			if (sibling.waypoints) {
				sibling.waypoints.slice(1, -1).forEach((waypoint, i) => {
					const nextWaypoint = sibling.waypoints[i + 2];
					const previousWaypoint = sibling.waypoints[i];
					if (!nextWaypoint || !previousWaypoint) {
						throw new Error('waypoints must exist');
					}
					if (nextWaypoint.x === waypoint.x ||
						nextWaypoint.y === waypoint.y ||
						previousWaypoint.x === waypoint.x ||
						previousWaypoint.y === waypoint.y
					) {
						snapPoints.add('mid', waypoint);
					}
				});
				return;
			}
			snapPoints.add('mid', SnapUtil.mid(sibling));
		});
		shape.incoming.forEach(c => {
			if (siblings.indexOf(c.source) === -1) {
				snapPoints.add('mid', SnapUtil.mid(c.source));
			}
			const docking = c.waypoints[0];
			snapPoints.add(c.id + '-docking', docking.original || docking);
		});
		shape.outgoing.forEach(c => {
			if (siblings.indexOf(c.target) === -1) {
				snapPoints.add('mid', SnapUtil.mid(c.target));
			}
			const docking = c.waypoints[c.waypoints.length - 1];
			snapPoints.add(c.id + '-docking', docking.original || docking);
		});
	}
}

(EasySnapping as any).$inject = ['eventBus', 'canvas'];
