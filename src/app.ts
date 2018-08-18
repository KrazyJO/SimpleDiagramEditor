import * as monaco from 'monaco-editor';
import Debugger from './Debugger';
// import Transformer from './transformer/Transformer';
import Diagram2JsonTransformer from './transformer/Diagram2JsonTransformer';

const EA = (window as any).EasyJS;


// const oTransformer = new Transformer();
const oDiagram2JsonTransformer = new Diagram2JsonTransformer();

//save the editor reference here for later use!
let myEditor : monaco.editor.IStandaloneCodeEditor;
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
	if (activeTab === 'Html') {
		editorHtmlContent.editorValue = myEditor.getValue();
	} else if (activeTab === 'Js') {
		editorJsContent.editorValue = myEditor.getValue();
	}


	oDebugger.debug(editorJsContent.editorValue, editorHtmlContent.editorValue);
	if (!oDebugger.isRunning()) {
		modeler.clear();
	}
}