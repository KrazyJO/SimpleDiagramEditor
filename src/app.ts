// import * as monaco from 'monaco-editor';
import Debugger from './Debugger';
import Diagram2JsonTransformer from './transformer/Diagram2JsonTransformer';
import EditorController from './EditorController';

const EA = (window as any).EasyJS;


// const oTransformer = new Transformer();
const oDiagram2JsonTransformer = new Diagram2JsonTransformer();

//save the editor reference here for later use!
// let myEditor : monaco.editor.IStandaloneCodeEditor;
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

export function getModeler() {
	return modeler;
}


$(document).ready(function () {
	let myEditor = oEditorController.initializeEditor();
	if (!myEditor) {
		alert('editor could not be initialized :(');
		return;
	}

	// set references
	oEditorController.setEditor(myEditor);
	oDebugger.setEditor(myEditor);

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
	//update current editor code
	if (oEditorController.getActiveTab() === 'Html') {
		oEditorController.setHtmlCode(oEditorController.getEditor().getValue());
	} else if (oEditorController.getActiveTab() === 'Js') {
		oEditorController.setJsCode(oEditorController.getEditor().getValue())
	}


	oDebugger.run(oEditorController.getJsContent(), oEditorController.getHtmlContent());
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
	oDebugger.disableDebuggerButtons();
	
	//interact and step runs asyc :(
	await modeler.interactWithModdle(injectModdleBackToApplication);
	oDebugger.step();

	//cannot catch proise resolve from within iframe
	//so this is an ugly solution, but it works :(
	setTimeout(function() {

		if (!oDebugger.isRunning()) {
			//clear after all steps are done
			modeler.clear();
		} else {
			//update moddle from diagram changes...
			oDebugger.enableDebuggerButtons();
			modeler.updateFromIframeModel();
		
		}
	},100);
	
}

export async function btnRunAll() {
	await modeler.interactWithModdle(injectModdleBackToApplication);
	oDebugger.runAll();
	modeler.clear();
}

export function btnDebugCode() {
	// oDebugger.debug(myEditor.getValue());
	if (oEditorController.getActiveTab() === 'Html') {
		oEditorController.setHtmlCode(oEditorController.getEditor().getValue());
	} else if (oEditorController.getActiveTab() === 'Js') {
		oEditorController.setJsCode(oEditorController.getEditor().getValue())
	}

	oDebugger.debug(oEditorController.getJsContent(), oEditorController.getHtmlContent());
	if (!oDebugger.isRunning()) {
		modeler.clear();
	}
}