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
	require('./diagram-ts/features/auto-scroll').default,
	require('./diagram-ts/features/hand-tool').default,
	require('./diagram-ts/features/lasso-tool').default,
	require('./diagram-ts/features/move').default,

	require('./features/context-pad').default,
	// require('./features/label-editing'),
	require('./features/modeling').default,
	require('./features/palette').default,
	require('./features/properties-panel'),
	require('./features/rules'),
	require('./features/snapping')
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
