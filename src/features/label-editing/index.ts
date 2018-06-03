//---------------------IMPORTS---------------------
import LabelEditingProvider from './LabelEditingProvider';
// import DirectEditingModule from 'diagram-js-direct-editing';
import DirectEditingModule from '../../diagram-js-direct-editing';

//---------------------EXPORT---------------------
module.exports = {
  __depends__: [
    // require('diagram-js/lib/command'),
    // require('diagram-js/lib/features/change-support'),
    require('../../diagram-ts/command').default,
    require('../../diagram-ts/features/change-support').default,
    DirectEditingModule
  ],
  __init__: [ 'labelEditingProvider' ],
  labelEditingProvider: [ 'type', LabelEditingProvider ]
};
