import * as monaco from 'monaco-editor';

const EA = (window as any).EasyJS;

// const XML =
// `
// <?xml version="1.0" encoding="UTF-8"?>
// <ea:EasyGraph id="eg_1" xmlns:ea="https://seblog.cs.uni-kassel.de/easy" xmlns:eadi="https://seblog.cs.uni-kassel.de/easydi" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
//   <eadi:EasyDiagram id="ed_1" />
// </ea:EasyGraph>
// `;

// const XML =
// `
// <?xml version="1.0" encoding="UTF-8"?>
// <sde:SimpleDebugEditorGraph id="eg_1" xmlns:ea="https://seblog.cs.uni-kassel.de/sde" xmlns:eadi="https://seblog.cs.uni-kassel.de/sdedi" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
//   <sdedi:SimpleDebugEditorDiagram id="ed_1" />
// </sde:SimpleDebugEditorGraph>
// `;

//now I understand :)
const XML: string =
	`
<?xml version="1.0" encoding="UTF-8"?>
<sde:SimpleDebugEditorGraph id="eg_1" xmlns:sde="https://seblog.cs.uni-kassel.de/sde" xmlns:sdedi="https://seblog.cs.uni-kassel.de/sdedi" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <sde:Node id="node_1" name="a"></sde:Node>
  <sde:Node id="node_2" name="b">
    <sde:members>
      prop1
    </sde:members>
    <sde:members>
      prop2
    </sde:members>
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


//save the editor reference here for later use!
let myEditor : monaco.editor.IStandaloneCodeEditor;

const modeler = new EA.Modeler({
	container: '#js-canvas',
	propertiesPanel: { parent: '#js-properties-panel' }
});

function createNewDiagram() {
	console.log('Start with creating the diagram!');
	modeler.importXML(XML, function (err: any) {
		if (!err) {
			modeler.get('canvas').zoom('fit-viewport');
			console.log('Yay look at this beautiful Diagram :D');
		} else {
			console.log('There went something wrong: ', err);
		}
	});
}

$(document).ready(function () {
  createNewDiagram();
	const editorContainer = document.getElementById('editor');
	if (editorContainer) {
		myEditor = monaco.editor.create(editorContainer, {
      value: [
        '// Press F4 to run your code!',
        'window.onload = function() {',
        '  const hw = document.createElement("div");',
        '  hw.innerText = "HelloWorld!";',
        '  document.body.appendChild(hw)',
        '  this.rootModle = {a : "1", b : "2"}',
        '}'
      ].join('\n'),
			language: 'javascript',
			theme : 'vs-dark'
    });
    myEditor.addCommand(monaco.KeyCode.F4, () => {
      const prev = document.getElementById('preview');
      if (prev) {
        prev.setAttribute('srcdoc', `<script>${myEditor.getValue()}</script>`);
      }
    }, '');
	}

});

export function btnRun() {
  const prev = <HTMLIFrameElement>document.getElementById('preview');
  let rootModle = prev.contentWindow["rootModle"];
  if (rootModle)
  {
    modeler.importFromJsonObject(rootModle);
    console.log(rootModle);
  }
}