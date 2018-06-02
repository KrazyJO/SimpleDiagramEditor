//---------------------IMPORTS---------------------
import { forEach, keys, reduce } from 'min-dash';

//---------------------CONSTANTS--------------------
const DEFAULT_FLOW = 'default';
const NAME = 'name';
const ID = 'id';

function getProperties(businessObject, propertyNames) {
  return reduce(
    propertyNames,
    function(result: any, key: string) {
      result[key] = businessObject.get(key);
      return result;
    },
    {}
  );
}

function setProperties(businessObject, properties) {
  forEach(properties, function(value, key) {
    businessObject.set(key, value);
  });
}

//---------------------CLASS---------------------
export default class UpdatePropertiesHandler {

  //---------------------CONSTRUCTOR---------------------
  constructor(private elementRegistry, private moddle) {}

  //---------------------METHODS---------------------
  execute(context) {
    const element = context.element;
    const changed = [element];
    if (!element) {
        throw new Error('element required');
    }
    const elementRegistry = this.elementRegistry;
    const ids = this.moddle.ids;
    const businessObject = element.businessObject;
    const properties = context.properties;
    const oldProperties = context.oldProperties || getProperties(businessObject, keys(properties));
    if (ID in properties) {
      ids.unclaim(businessObject[ID]);
      elementRegistry.updateId(element, properties[ID]);
    }
    // correctly indicate visual changes on default flow updates
    if (DEFAULT_FLOW in properties) {
      if (properties[DEFAULT_FLOW]) {
        changed.push(elementRegistry.get(properties[DEFAULT_FLOW].id));
      }
      if (businessObject[DEFAULT_FLOW]) {
        changed.push(elementRegistry.get(businessObject[DEFAULT_FLOW].id));
      }
    }
    if (NAME in properties && element.label) {
      changed.push(element.label);
      // show the label
      element.label.hidden = !properties[NAME];
    }
    // update properties
    setProperties(businessObject, properties);
    // store old values
    context.oldProperties = oldProperties;
    context.changed = changed;
    // indicate changed on objects affected by the update
    return changed;
  }

  revert(context) {
    const element = context.element;
    const properties = context.properties;
    const oldProperties = context.oldProperties;
    const businessObject = element.businessObject;
    const elementRegistry = this.elementRegistry;
    const ids = this.moddle.ids;
    // update properties
    setProperties(businessObject, oldProperties);
    if (ID in properties) {
      ids.unclaim(properties[ID]);
      elementRegistry.updateId(element, oldProperties[ID]);
    }
    return context.changed;
  }
}

(UpdatePropertiesHandler as any).$inject = ['elementRegistry', 'moddle'];
