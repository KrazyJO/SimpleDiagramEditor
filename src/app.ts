import * as monaco from 'monaco-editor';

const EA = (window as any).EasyJS;

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
	<sdedi:SimpleDebugEditorDiagram id="ed_1">
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
	</sdedi:SimpleDebugEditorDiagram>
</sde:SimpleDebugEditorGraph>
`;

/**
 * Maybe this will work later...
 * @param init should it be used?
 */
function initResizer(init) {
	let resizer = $('.resizer');
	let diagramContainer = $('#diagramContainer')[0];
	let frameContainer = $('#frameContainer')[0];
	if (!init) {
		resizer[0].setAttribute('style', 'display: none;');
		diagramContainer.setAttribute('style', 'height: 50%;');
		frameContainer.setAttribute('style', 'height: 50%;');
		return;
	}

	let mouseDown = false;
	resizer.on('mousedown', () => {
		// console.log("resizer mouse down");
		mouseDown = true;
	})

	$(document).on('mouseup', () => {
		console.log("resizer mouse up");
		mouseDown = false;
	})

	resizer.on('mousemove', (evt) => {
		if (mouseDown)
		{
			console.log(evt);
			let windowContainer = $('#windowContainer')[0];
			let newFrameHeight = windowContainer.offsetHeight - evt.pageY;
			let percentage = (newFrameHeight / windowContainer.offsetHeight) * 100;
			diagramContainer.setAttribute('style', `height: calc(${percentage}% - 2px);`);
			let percentage2 = 100 - percentage;
			frameContainer.setAttribute('style', `height: calc(${percentage2}% - 2px);`);
		}


	})
}

initResizer(false);

//save the editor reference here for later use!
let myEditor : monaco.editor.IStandaloneCodeEditor;

const modeler = new EA.Modeler({
	container: '#js-canvas',
	propertiesPanel: { parent: '#js-properties-panel' }
});

function createNewDiagram(preventImport) {
	if (preventImport)
	{
		return;
	}
	// console.log('Start with creating the diagram!');
	modeler.importXML(XML, function (err: any) {
		if (!err) {
			modeler.get('canvas').zoom('fit-viewport');
			// console.log('Yay look at this beautiful Diagram :D');
		} else {
			console.log('There went something wrong: ', err);
		}
	});
}

let steps = ['step1', 'step2', 'step3'];

$(document).ready(function () {
	createNewDiagram(true);
	const editorContainer = document.getElementById('editor');
	if (editorContainer) {
		myEditor = monaco.editor.create(editorContainer, {
			value: [
				'// Press F4 to run your code!',
				'window.onload = function() {',
				'  const hw = document.createElement("div");',
				'  hw.setAttribute("id", "hw");',
				'  hw.innerText = "HelloWorld!";',
				'  document.body.appendChild(hw)',
				'  let Foo = function(){',
				'    let b = 2;',
				'    this.b = 42;',
				'  };',
				'  class Bar {',
				'    constructor(value) {',
				'      this.barValue = 4200;',
				'      this.newFoo = new Foo();',
				'      this.newFoo.newnewFoo = new Foo();',
				'      this.newFoo.newnewFoo.newnewnewFoo = new Foo();',
				'      this.newFoo.newnewFoo.newnewnewFoo.c = "c";',
				'    }',
				'  }',
				'  let bar = new Bar()',
				'  let foo = new Foo();',
				'  this.rootModle = {foo : foo, bar : bar, a : "1", b : "2", c : {d: 42}, e : {f : 12} }',
				'}',
				'function doStep(sStepFunctionName) {',
				'  if (window[sStepFunctionName] && typeof window[sStepFunctionName] === "function") {',
				'    window[sStepFunctionName].call(this);',
				'  }',
				'}',
				'function step1() {',
				'	const hw = document.getElementById("hw");',
				'	let hwText = hw.innerText;',
				'	hwText += "\\nstep1";',
				'	hw.innerText = hwText;',
				'  }',
				'function step2() {',
				'	const hw = document.getElementById("hw");',
				'	let hwText = hw.innerText;',
				'	hwText += "\\nstep2";',
				'	hw.innerText = hwText;',
				'  }',
				'function step3() {',
				'	const hw = document.getElementById("hw");',
				'	let hwText = hw.innerText;',
				'	hwText += "\\nstep3";',
				'	hw.innerText = hwText;',
				'  }'
			].join('\n'),
			language: 'javascript',
			theme : 'vs-dark'
		});
		myEditor.addCommand(monaco.KeyCode.F4, () => {
			// const prev = document.getElementById('preview');
			// if (prev) {
			//   prev.setAttribute('srcdoc', `<script>${myEditor.getValue()}</script>`);
			// }
			run();
		}, '');
	}

});

function run() {
	const prev = document.getElementById('preview');
	if (prev) {
		prev.setAttribute('srcdoc', `<script>${myEditor.getValue()}</script>`);
	}
}

export function btnRun() {
	const prev = <HTMLIFrameElement>document.getElementById('preview');
	let rootModle = prev.contentWindow["rootModle"];
	if (rootModle)
	{
		modeler.importFromJsonObject(rootModle);
		console.log(rootModle);
	}
}

export function getModel() {
	console.log("getModel() call modeler.getModdel()");
	modeler.getModdel();
}

export function btnRunCode() {
	run();
}

/**
 * do the next step in application
 * if no step is ava
 */
export function btnDoStep() {
	let sFunctionName : string = steps.shift();
	if (sFunctionName) {
		const prev : any = document.getElementById('preview');
		prev.contentWindow.doStep(sFunctionName);
	} 

	//was it the last step? disable button
	if (steps.length === 0)
	{
		let btn : any = $('#btnStep')[0];
		btn.disabled = true;
	}

}