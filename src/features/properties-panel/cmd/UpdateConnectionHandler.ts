//---------------------CLASS---------------------
export default class UpdateConnectionHandler {

    //---------------------CONSTRUCTOR---------------------
    constructor(public elementRegistry, public moddle) { }

    //---------------------METHODS---------------------
    execute(context) {
        const element = context.element;
        const changed = [element];
        if (!element) {
            throw new Error('element required');
        }

        //element.businessObject.name ist zu ändern
        //context.newLabel hat den neuen Wert
        context.oldName = element.businessObject.name;
        element.businessObject.name = context.newLabel;

        context.changed = changed;

        return changed;
    }

    revert(context) {
        context.businessObject.name = context.oldName;
        return context.changed;
    }
}

(UpdateConnectionHandler as any).$inject = ['elementRegistry', 'moddle'];
