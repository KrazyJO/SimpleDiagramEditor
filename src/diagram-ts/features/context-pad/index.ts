import InteractionEventsModule from '../interaction-events';
import OverlaysModule from '../overlays';

import ContextPad from './ContextPad';


module.exports = {
  __depends__: [
    InteractionEventsModule,
    OverlaysModule
  ],
  contextPad: [ 'type', ContextPad ]
};