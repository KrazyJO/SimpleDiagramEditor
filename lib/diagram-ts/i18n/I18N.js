/**
 * A component that handles language switching in a unified way.
 *
 * @param {EventBus} eventBus
 */
var I18N = /** @class */ (function () {
    function I18N(eventBus) {
        /**
         * Inform components that the language changed.
         *
         * Emit a `i18n.changed` event for others to hook into, too.
         */
        this.changed = function changed() {
            eventBus.fire('i18n.changed');
        };
    }
    I18N.$inject = ['eventBus'];
    return I18N;
}());
export default I18N;
//# sourceMappingURL=I18N.js.map