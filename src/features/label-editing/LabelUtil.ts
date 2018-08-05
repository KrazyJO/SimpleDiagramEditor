//---------------------IMPORTS---------------------
import { assign } from 'lodash';
// import { is } from '../../utils/ModelUtil';
import { is } from '@utils/ModelUtil';

//---------------------CONSTANTS---------------------
export const DEFAULT_LABEL_SIZE = {
  width: 90,
  height: 20
};

//---------------------METHODS---------------------
export function getLabel(element) {
  const businessObject = element.businessObject;
  return businessObject.name;
}

export function setLabel(element, text) {
  const businessObject = element.businessObject;
  businessObject.name = text;
  const label = element.label || element;
  label.hidden = false;
  return label;
}

export function hasExternalLabel(businessObject): boolean {
  return is(businessObject, 'sde:Edge');
}

export function getWaypointsMid(waypoints) {
  const mid = waypoints.length / 2 - 1;
  const first = waypoints[Math.floor(mid)];
  const second = waypoints[Math.ceil(mid + 0.01)];
  return {
    x: first.x + (second.x - first.x) / 2,
    y: first.y + (second.y - first.y) / 2
  };
}

export function getExternalLabelMid(element) {
  if (element.waypoints) {
    return getWaypointsMid(element.waypoints);
  }
  else {
    return {
      x: element.x + element.width / 2,
      y: element.y + element.height + DEFAULT_LABEL_SIZE.height / 2
    };
  }
}

export function getExternalLabelBounds(semantic, element) {
  let mid;
  let size;
  let bounds;
  const di = semantic.di;
  const label = di.label;
  if (label && label.bounds) {
    bounds = label.bounds;
    size = {
      width: Math.max(DEFAULT_LABEL_SIZE.width, bounds.width),
      height: bounds.height
    };
    mid = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    };
  } else {
    mid = getExternalLabelMid(element);
    size = DEFAULT_LABEL_SIZE;
  }
  return assign({
    x: mid.x - size.width / 2,
    y: mid.y - size.height / 2
  }, size);
}
