import SelectionModule from '../selection';
import RulesModule from '../rules';
import DraggingModule from '../dragging';

import Connect from './Connect';

let defexport = {
  __depends__: [
    SelectionModule,
    RulesModule,
    DraggingModule
  ],
  connect: [ 'type', Connect ]
}; 

export default defexport;

module.exports = defexport;
