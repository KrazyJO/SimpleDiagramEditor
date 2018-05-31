import DraggingModule from '../dragging';
import SelectionModule from '../selection';
import RulesModule from '../rules';

import Create from './Create';

let defexport = {
  __depends__: [
    DraggingModule,
    SelectionModule,
    RulesModule
  ],
  create: [ 'type', Create ]
};

export default defexport;

module.exports = defexport;
