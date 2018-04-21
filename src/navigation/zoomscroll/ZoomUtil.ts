import {
  log10
} from '../../util/Math';

/**
 * Get step size for given range and number of steps.
 *
 * @param {Object} range - Range.
 * @param {number} range.min - Range minimum.
 * @param {number} range.max - Range maximum.
 */
export function getStepSize(range : any, steps : any) : any {

  var minLinearRange = log10(range.min),
      maxLinearRange = log10(range.max);

  var absoluteLinearRange = Math.abs(minLinearRange) + Math.abs(maxLinearRange);

  return absoluteLinearRange / steps;
}

export function cap(range : any, scale : any) {
  return Math.max(range.min, Math.min(range.max, scale));
}
