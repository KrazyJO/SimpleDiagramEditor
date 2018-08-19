// import * as monaco from 'monaco-editor';
import Debugger from './Debugger';
import EditorController from './EditorController';

const EA = (window as any).EasyJS;

//save the editor reference here for later use!
const oEditorController = new EditorController();

const oDebugger = new Debugger();

const modeler = new EA.Modeler({
	container: '#js-canvas',
	propertiesPanel: { parent: '#js-properties-panel' }
});

oDebugger.setModeler(modeler);

//function to activate the debugger
window.addEventListener('message', function(event) {
	if (event.data === 'debugger:activate')
	{
		oDebugger.activate();
		console.log(event.data);
	}
});

$(document).ready(function () {
	let myEditor = oEditorController.initializeEditor();
	if (!myEditor) {
		alert('editor could not be initialized :(');
		return;
	}

	// set references
	oEditorController.setEditor(myEditor);
	oDebugger.setEditorController(oEditorController);

});
export function monacoHtml() {
	oEditorController.showHtml();
}

export function monacoJs() {
	oEditorController.showJs();
}

export async function downloadModel() {
	modeler.getModdel();
	var anchor = document.createElement('a');
	var xmlstring = await modeler.getModdel();
	var content = "data:application/octet-stream;charset=utf-16le;base64,"+ btoa(xmlstring);
	anchor.setAttribute("href", content);
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
}


export function runCode() {
	oDebugger.runCode();
}

/**
 * do the next step in application
 * if no step is ava
 */
export async function btnDoStep() {
	oDebugger.doStep();
	
}

export async function btnRunAll() {
	oDebugger.runAll();
}

export function btnDebugCode() {
	oDebugger.debugCode();
}