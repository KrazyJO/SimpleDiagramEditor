//---------------------IMPORTS---------------------
import ContextPadProvider from './ContextPadProvider';

//---------------------EXPORTS---------------------
export default {
  __depends__: [
    require('../../diagram-js-direct-editing').default,
    require('@diagram-ts/features/context-pad').default,
    require('@diagram-ts/features/selection').default,
    require('@diagram-ts/features/connect').default,
    require('@diagram-ts/features/create').default
  ],
  __init__: ['contextPadProvider'],
  contextPadProvider: ['type', ContextPadProvider]
};
