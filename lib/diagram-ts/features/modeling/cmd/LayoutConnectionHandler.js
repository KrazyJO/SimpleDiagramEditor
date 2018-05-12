import { assign } from 'min-dash';
/**
 * A handler that implements reversible moving of shapes.
 */
var LayoutConnectionHandler = /** @class */ (function () {
    function LayoutConnectionHandler(layouter, canvas) {
        this._layouter = layouter;
        this._canvas = canvas;
    }
    LayoutConnectionHandler.prototype.execute = function (context) {
        var connection = context.connection;
        var oldWaypoints = connection.waypoints;
        assign(context, {
            oldWaypoints: oldWaypoints
        });
        connection.waypoints = this._layouter.layoutConnection(connection, context.hints);
        return connection;
    };
    ;
    LayoutConnectionHandler.prototype.revert = function (context) {
        var connection = context.connection;
        connection.waypoints = context.oldWaypoints;
        return connection;
    };
    ;
    LayoutConnectionHandler.$inject = ['layouter', 'canvas'];
    return LayoutConnectionHandler;
}());
export default LayoutConnectionHandler;
//# sourceMappingURL=LayoutConnectionHandler.js.map