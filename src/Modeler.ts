//---------------------IMPORTS---------------------
import '../assets/scss/main.scss';
import { Viewer } from './Viewer';

//---------------------CONSTANTS---------------------
const DEFAULT_PRIORITY = 1000;
const DEFAULT_OPTIONS: any = {
	width: '100%',
	height: '100%',
	position: 'relative',
	container: 'body'
};
const DEFAULT_MODULES = [
	// modeling components
	require('./diagram-ts/features/auto-scroll'),
	require('./diagram-ts/features/hand-tool'),
	require('./diagram-ts/features/lasso-tool'),
	require('./diagram-ts/features/move'),

	// require('./features/context-pad'),
	// require('./features/origin'),
	// require('./features/grid-background'),
	// require('./features/label-editing'),
	// require('./features/modeling'),
	// require('./features/palette'),
	// require('./features/properties-panel'),
	// require('./features/rules'),
	// require('./features/snapping')
];

//---------------------CLASS--------------------
export class Modeler extends Viewer {

	//---------------------CONSTRUCTOR---------------------
	constructor(options?: any) {
		options = { ...DEFAULT_OPTIONS, ...options };
		super(options, DEFAULT_MODULES);
		this.on('import.parse.complete', DEFAULT_PRIORITY, (event: any) => {
			if (!event.error) {
				this.collectIds(event.definitions, event.context);
			}
		}, this);
		this.on('diagram.destroy', DEFAULT_PRIORITY, () => {
			this.moddle.ids.clear();
		}, this);
	}
}
