//---------------------IMPORTS---------------------
import EasyRules from './EasyRules';

//---------------------EXPORTS---------------------
module.exports = {
  __depends__: [ require('../../diagram-ts/features/rules') ],
  __init__: [ 'easyRules' ],
  easyRules: [ 'type', EasyRules ]
};
