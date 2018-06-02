//---------------------IMPORTS---------------------
import EasyElementFactory from './EasyElementFactory';
import EasyLayouter from './EasyLayouter';
import EasyFactory from './EasyFactory';
import EasyUpdater from './EasyUpdater';
import EasyModeling from './EasyModeling';

//---------------------EXPORTS---------------------
export default {
	__init__: ['modeling', 'easyUpdater'],
	__depends__: [
		// require('../label-editing'),
		require('../rules'),

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
	connectionDocking: ['type', require('../../diagram-ts/layout/CroppingConnectionDocking').default]
  };
  