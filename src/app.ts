const EA = (window as any).EasyJS;

const XML =
`
<?xml version="1.0" encoding="UTF-8"?>
<ea:EasyGraph id="eg_1" xmlns:ea="https://seblog.cs.uni-kassel.de/easy" xmlns:eadi="https://seblog.cs.uni-kassel.de/easydi" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <eadi:EasyDiagram id="ed_1" />
</ea:EasyGraph>
`;

const modeler = new EA.Modeler({
  container: '#js-canvas',
  propertiesPanel: {parent: '#js-properties-panel'}
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

$(document).ready(function() {
  createNewDiagram();
});
