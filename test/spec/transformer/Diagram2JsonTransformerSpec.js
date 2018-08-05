import Diagram2JsonTransformer from '../../../src/transformer/Diagram2JsonTransformer';
import { isExportDeclaration } from '../../../node_modules/typescript';

describe('Diagram2JsonTransformer', () => {
    describe('transform simple object', () => {
        it('should transform to the corresponding object',() => {

            let xml = 
            `<?xml version="1.0" encoding="UTF-8"?>
            <sde:SimpleDebugEditorGraph xmlns:sde="https://seblog.cs.uni-kassel.de/sde" xmlns:sdedi="https://seblog.cs.uni-kassel.de/sdedi" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="eg_1">
              <sde:Node id="node_0" name="root" class="Object">
                <sde:Member name="b" propType="number" value="12" />
                <sde:Member name="a" propType="string" value="2" />
              </sde:Node>
              <sde:Node id="node_2" name="c" class="Object">
                <sde:Member name="str" propType="string" value="this is c" />
              </sde:Node>
              <sde:Node id="node_3" name="d" class="Object">
                <sde:Member name="str" propType="string" value="this is d" />
              </sde:Node>
              <sde:Node id="node_4" name="obj" class="Object">
                <sde:Member name="str" propType="string" value="this is c" />
              </sde:Node>
              <sde:Edge id="edge_3" sourceNode="node_3" targetNode="node_4" name="edge3" />
              <sde:Edge id="edge_1" sourceNode="node_0" targetNode="node_2" name="edge1" />
              <sde:Edge id="edge_2" sourceNode="node_0" targetNode="node_3" name="edge2" />
              <sdedi:SimpleDebugEditorDiagram id="ed_1">
                <sdedi:SimpleDebugEditorShape id="shape_0" simpleDebugEditorElement="node_0">
                  <dc:Bounds x="0" y="0" width="150" height="100" />
                </sdedi:SimpleDebugEditorShape>
                <sdedi:SimpleDebugEditorShape id="shape_2" simpleDebugEditorElement="node_2">
                  <dc:Bounds x="0" y="150" width="150" height="100" />
                </sdedi:SimpleDebugEditorShape>
                <sdedi:SimpleDebugEditorShape id="shape_3" simpleDebugEditorElement="node_3">
                  <dc:Bounds x="200" y="150" width="150" height="100" />
                </sdedi:SimpleDebugEditorShape>
                <sdedi:SimpleDebugEditorShape id="shape_4" simpleDebugEditorElement="node_4">
                  <dc:Bounds x="200" y="300" width="150" height="100" />
                </sdedi:SimpleDebugEditorShape>
                <sdedi:SimpleDebugEditorEdge id="conn_3" simpleDebugEditorElement="edge_3" sourceElement="shape_3" targetElement="shape_4">
                  <di:waypoint x="275" y="250" />
                  <di:waypoint x="275" y="300" />
                </sdedi:SimpleDebugEditorEdge>
                <sdedi:SimpleDebugEditorEdge id="conn_1" simpleDebugEditorElement="edge_1" sourceElement="shape_0" targetElement="shape_2">
                  <di:waypoint x="75" y="100" />
                  <di:waypoint x="75" y="150" />
                </sdedi:SimpleDebugEditorEdge>
                <sdedi:SimpleDebugEditorEdge id="conn_2" simpleDebugEditorElement="edge_2" sourceElement="shape_0" targetElement="shape_3">
                  <di:waypoint x="75" y="100" />
                  <di:waypoint x="275" y="150" />
                </sdedi:SimpleDebugEditorEdge>
              </sdedi:SimpleDebugEditorDiagram>
            </sde:SimpleDebugEditorGraph>`;

            const transformer = new Diagram2JsonTransformer();
            let output = transformer.transform(xml);

            expect(output).to.be.an('object'); 
            expect(output.a).to.equal("2"); // shoud be a string
            expect(output.b).to.equal(12); // should be a number
            expect(output.c).to.be.an('object');
            expect(output.c.str).to.equal('this is c');
            expect(output.d).to.be.an('object');
            expect(output.d.str).to.equal('this is d');
            expect(output.d.obj.str).to.equal('this is c');

        });
    });
});