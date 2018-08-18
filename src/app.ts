import * as monaco from 'monaco-editor';
import Debugger from './Debugger';
// import Transformer from './transformer/Transformer';
import Diagram2JsonTransformer from './transformer/Diagram2JsonTransformer';

const EA = (window as any).EasyJS;


// const oTransformer = new Transformer();
const oDiagram2JsonTransformer = new Diagram2JsonTransformer();

//now I understand :)
const XML: string =
	`
<?xml version="1.0" encoding="UTF-8"?>
<sde:SimpleDebugEditorGraph id="eg_1" xmlns:sde="https://seblog.cs.uni-kassel.de/sde" xmlns:sdedi="https://seblog.cs.uni-kassel.de/sdedi" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
	<sde:Node id="node_1" name="a"></sde:Node>
	<sde:Node id="node_2" name="b">
			<sde:Member id="member_1" name="prop1" propType="string" value="12"></sde:Member>
			<sde:Member id="member_2" name="prop2" propType="number" value="42"></sde:Member>
	</sde:Node>
	<sde:Edge id="edge_1" sourceNode="node_1" name="edge1" targetNode="node_2"></sde:Edge>
	<sdedi:SimpleDebugEditor id="ed_1">
		<sdedi:SimpleDebugEditorShape id="shape_1" simpleDebugEditorElement="node_1">
			<dc:Bounds x="500" y="200" width="150" height="100" />
		</sdedi:SimpleDebugEditorShape>
		<sdedi:SimpleDebugEditorShape id="shape_2" simpleDebugEditorElement="node_2">
			<dc:Bounds x="800" y="200" width="150" height="100" />
		</sdedi:SimpleDebugEditorShape>
		<sdedi:SimpleDebugEditorEdge id="conn_1" simpleDebugEditorElement="edge_1" sourceElement="shape_1" targetElement="shape_2">
			<di:waypoint x="650" y="250" />
			<di:waypoint x="800" y="250" />
		</sdedi:SimpleDebugEditorEdge>
	</sdedi:SimpleDebugEditor>
</sde:SimpleDebugEditorGraph>
`;

/**
 * Maybe this will work later...
 * @param init should it be used?
 */
// function initResizer(init) {
// 	let resizer = $('.resizer');
// 	let Container = $('#Container')[0];
// 	let frameContainer = $('#frameContainer')[0];
// 	if (!init) {
// 		resizer[0].setAttribute('style', 'display: none;');
// 		Container.setAttribute('style', 'height: 50%;');
// 		frameContainer.setAttribute('style', 'height: 50%;');
// 		return;
// 	}

// 	let mouseDown = false;
// 	resizer.on('mousedown', () => {
// 		// console.log("resizer mouse down");
// 		mouseDown = true;
// 	});

// 	$(document).on('mouseup', () => {
// 		console.log("resizer mouse up");
// 		mouseDown = false;
// 	});

// 	resizer.on('mousemove', (evt) => {
// 		if (mouseDown)
// 		{
// 			console.log(evt);
// 			let windowContainer = $('#windowContainer')[0];
// 			let newFrameHeight = windowContainer.offsetHeight - evt.pageY;
// 			let percentage = (newFrameHeight / windowContainer.offsetHeight) * 100;
// 			Container.setAttribute('style', `height: calc(${percentage}% - 2px);`);
// 			let percentage2 = 100 - percentage;
// 			frameContainer.setAttribute('style', `height: calc(${percentage2}% - 2px);`);
// 		}
// 	});
// }

// initResizer(false);

//save the editor reference here for later use!

let myEditor : monaco.editor.IStandaloneCodeEditor;
const oDebugger = new Debugger();

const modeler = new EA.Modeler({
	container: '#js-canvas',
	propertiesPanel: { parent: '#js-properties-panel' }
});


//function to activate the debugger
window.addEventListener('message', function(event) {
	if (event.data === 'debugger:activate')
	{
		oDebugger.activate();
		console.log(event.data);
	}
});

export function getModeler() {
	return modeler;
}

function createNew(preventImport) {
	if (preventImport)
	{
		return;
	}
	// console.log('Start with creating the !');
	modeler.importXML(XML, function (err: any) {
		if (!err) {
			modeler.get('canvas').zoom('fit-viewport');
			// console.log('Yay look at this beautiful  :D');
		} else {
			console.log('There went something wrong: ', err);
		}
	});
}

$(document).ready(function () {
	createNew(true);
	const editorContainer = document.getElementById('editor');
	if (editorContainer) {
		// let demoCodeJs = require('./demoCode/app.txt');
		// let demoCodeHtml = require('./demoCode/html.txt');
		let demoCodeJs = require('./demoCode/bbqapp.txt');
		let demoCodeHtml = require('./demoCode/bbqhtml.txt');
		editorJsContent.editorValue = demoCodeJs;
		editorHtmlContent.editorValue = demoCodeHtml;
		myEditor = monaco.editor.create(editorContainer, {
			value : demoCodeJs,
			language: 'javascript',
			theme : 'vs-dark',
			glyphMargin: true
		});
		myEditor.addCommand(monaco.KeyCode.F4, () => {
			runCode();
		}, '');

		oDebugger.setEditor(myEditor);
	}

});
let editorHtmlContent = {
	editorValue : '',
	editorScrollHeight : 0	
};
let editorJsContent = {
	editorValue : '',
	editorScrollHeight : 0	
};
let activeTab = 'Js';
export function monacoHtml() {
	if (activeTab === 'Html') {
		return;
	}

	activeTab = 'Html';
	editorJsContent.editorScrollHeight = myEditor.getScrollTop();
	editorJsContent.editorValue = myEditor.getValue();
	myEditor.setValue(editorHtmlContent.editorValue);
	myEditor.setScrollTop(editorHtmlContent.editorScrollHeight);
	monaco.editor.setModelLanguage(myEditor.getModel(), 'html');
}

export function monacoJs() {
	if (activeTab === 'Js')
	{
		return;
	}

	activeTab = 'Js';
	editorHtmlContent.editorScrollHeight = myEditor.getScrollTop();
	editorHtmlContent.editorValue = myEditor.getValue();
	myEditor.setValue(editorJsContent.editorValue);
	myEditor.setScrollTop(editorJsContent.editorScrollHeight);
	monaco.editor.setModelLanguage(myEditor.getModel(), 'javascript');
}

export function update() {
	const prev = <HTMLIFrameElement>document.getElementById('preview');
	let rootModle = prev.contentWindow["rootModle"];
	if (rootModle)
	{
		modeler.importFromJsonObject(rootModle);
	}
}

export function getModel() {
	modeler.getModdel();
}


export function runCode() {
	//update current editor code
	if (activeTab === 'Html') {
		editorHtmlContent.editorValue = myEditor.getValue();
	} else if (activeTab === 'Js') {
		editorJsContent.editorValue = myEditor.getValue();
	}


	oDebugger.run(editorJsContent.editorValue, editorHtmlContent.editorValue);
	modeler.clear();
}

/**
 * transforms current diagram moddle object and replaces it with 'rootModle' in application
 * @param xml diagram xml string
 */
function injectModdleBackToApplication(xml: string) {
	let rootObject = oDiagram2JsonTransformer.transform(xml);
	if (rootObject) {
		const prev = <HTMLIFrameElement>document.getElementById('preview');
		prev.contentWindow["rootModle"] = rootObject;
	}

}

/**
 * do the next step in application
 * if no step is ava
 */
export async function btnDoStep() {
	//this all runs asyc :(
	await modeler.interactWithModdle(injectModdleBackToApplication);
	oDebugger.step();
	
	//clear after all steps are done
	if (!oDebugger.isRunning()) {
		modeler.clear();
	} else {
		setTimeout(function() {
			//update moddle from diagram changes...
			update();
		},100);
	}
}

export async function btnRunAll() {
	await modeler.interactWithModdle(injectModdleBackToApplication);
	oDebugger.runAll();
	modeler.clear();
}

export function btnDebugCode() {
	// oDebugger.debug(myEditor.getValue());
	if (activeTab === 'Html') {
		editorHtmlContent.editorValue = myEditor.getValue();
	} else if (activeTab === 'Js') {
		editorJsContent.editorValue = myEditor.getValue();
	}


	oDebugger.debug(editorJsContent.editorValue, editorHtmlContent.editorValue);
	if (oDebugger.isRunning()) {
		update();
	} else {
		modeler.clear();
	}
}