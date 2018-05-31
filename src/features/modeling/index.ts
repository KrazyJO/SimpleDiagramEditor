//---------------------IMPORTS---------------------
import EasyElementFactory from './EasyElementFactory';
import EasyLayouter from './EasyLayouter';
import EasyFactory from './EasyFactory';
import EasyUpdater from './EasyUpdater';
import EasyModeling from './EasyModeling';

//---------------------EXPORTS---------------------
// module.exports = {
// 	__init__: ['modeling', 'easyUpdater'],
// 	__depends__: [
// 		// require('../label-editing'),
// 		// require('../rules'),

// 		// require('diagram-js/lib/command'),
// 		// require('diagram-js/lib/features/tooltips'),
// 		// require('diagram-js/lib/features/label-support'),
// 		// require('diagram-js/lib/features/attach-support'),
// 		// require('diagram-js/lib/features/selection'),
// 		// require('diagram-js/lib/features/change-support'),
// 		// require('diagram-js/lib/features/space-tool')
// 		require('../../diagram-ts/command'),
// 		require('../../diagram-ts/features/tooltips'),
// 		require('../../diagram-ts/features/label-support'),
// 		require('../../diagram-ts/features/attach-support'),
// 		require('../../diagram-ts/features/selection'),
// 		require('../../diagram-ts/features/change-support'),
// 		require('../../diagram-ts/features/space-tool')
// 	],
// 	elementFactory: ['type', EasyElementFactory],
// 	layouter: ['type', EasyLayouter],
// 	easyFactory: ['type', EasyFactory],
// 	easyUpdater: ['type', EasyUpdater],
// 	modeling: ['type', EasyModeling],
// 	connectionDocking: ['type', require('../../diagram-ts/layout/CroppingConnectionDocking')]
// };
module.exports = {
	__init__: ['modeling', 'easyUpdater'],
	__depends__: [
		// require('../label-editing'),
		// require('../rules'),

		require('../../diagram-ts/command'),
		require('../../diagram-ts/features/tooltips'),
		require('../../diagram-ts/features/label-support'),
		require('../../diagram-ts/features/attach-support'),
		require('../../diagram-ts/features/selection'),
		require('../../diagram-ts/features/change-support'),
		require('../../diagram-ts/features/space-tool')
	],
	elementFactory: ['type', EasyElementFactory],
	layouter: ['type', EasyLayouter],
	easyFactory: ['type', EasyFactory],
	easyUpdater: ['type', EasyUpdater],
	modeling: ['type', EasyModeling],
	connectionDocking: ['type', require('../../diagram-ts/layout/CroppingConnectionDocking')]
  };
  