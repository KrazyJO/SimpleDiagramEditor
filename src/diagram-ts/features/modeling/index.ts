import CommandModule from '../../command';
import ChangeSupportModule from '../change-support';
import SelectionModule from '../selection';
import RulesModule from '../rules';

import Modeling from './Modeling';
import BaseLayouter from '../../layout/BaseLayouter';


module.exports = {
  __depends__: [
    CommandModule,
    ChangeSupportModule,
    SelectionModule,
    RulesModule
  ],
  __init__: [ 'modeling' ],
  modeling: [ 'type', Modeling ],
  layouter: [ 'type', BaseLayouter ]
};
