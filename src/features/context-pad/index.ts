//---------------------IMPORTS---------------------
import ContextPadProvider from './ContextPadProvider';

//---------------------EXPORTS---------------------
export default {
  __depends__: [
    require('../../diagram-js-direct-editing').default,
    // require('diagram-js/lib/features/context-pad'),
    require('@diagram-ts/features/context-pad'),
    // require('diagram-js/lib/features/selection'),
    require('@diagram-ts/features/selection').default,
    // require('diagram-js/lib/features/connect'),
    require('@diagram-ts/features/connect'),
    // require('diagram-js/lib/features/create'),
    require('@diagram-ts/features/create')
  ],
  __init__: ['contextPadProvider'],
  contextPadProvider: ['type', ContextPadProvider]
};
