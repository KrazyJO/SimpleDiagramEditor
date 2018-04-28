export default class UpdateWaypointsHandler {
	public execute(context: any) {

		var connection = context.connection,
			newWaypoints = context.newWaypoints;

		context.oldWaypoints = connection.waypoints;

		connection.waypoints = newWaypoints;

		return connection;
	};

	public revert(context: any) {

		var connection = context.connection,
			oldWaypoints = context.oldWaypoints;

		connection.waypoints = oldWaypoints;

		return connection;
	};
}

