import Diagram2JsonTransformer from 'src/transformer/Diagram2JsonTransformer';

import { expect } from "chai";
var chai = require('chai');
chai.use(require('sinon-chai')); 

describe('Diagram2JsonTransformer', () => {
    describe('transform simple object', () => {
        it('should transform to the corresponding object',() => {

            let xml = 
            `<?xml version="1.0" encoding="UTF-8"?>
              <sde:SimpleDebugEditorGraph id="eg_1" xmlns:sde="https://seblog.cs.uni-kassel.de/sde" xmlns:sdedi="https://seblog.cs.uni-kassel.de/sdedi" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
              <sde:Node id="node_0" name="root" class="Object">
                <sde:Member name="a" propType="string" value="12"></sde:Member>
                <sde:Member name="b" propType="number" value="45"></sde:Member>
              </sde:Node>
              <sde:Node id="node_2" name="c" class="Object">
                <sde:Member name="d" propType="string" value="42"></sde:Member>
                <sde:Member name="str" propType="string" value="this is c"></sde:Member>
              </sde:Node>
              <sde:Edge id="edge_1" sourceNode="node_0" name="new Edge" targetNode="node_2" />
              <sdedi:SimpleDebugEditorDiagram id="ed_1">
                <sdedi:SimpleDebugEditorShape id="shape_0" simpleDebugEditorElement="node_0">
                  <dc:Bounds x="0" y="0" width="150" height="100" />
                </sdedi:SimpleDebugEditorShape>
                <sdedi:SimpleDebugEditorShape id="shape_2" simpleDebugEditorElement="node_2">
                  <dc:Bounds x="0" y="150" width="150" height="100" />
                </sdedi:SimpleDebugEditorShape>
                <sdedi:SimpleDebugEditorShape id="Node_0yoji2r_di" simpleDebugEditorElement="Node_0yoji2r">
                  <dc:Bounds x="0" y="150" width="150" height="100" />
                </sdedi:SimpleDebugEditorShape>
                <sdedi:SimpleDebugEditorEdge id="conn_1" simpleDebugEditorElement="edge_1" sourceElement="shape_0" targetElement="shape_2">
                  <di:waypoint x="75" y="100" />
                  <di:waypoint x="75" y="150" />
                </sdedi:SimpleDebugEditorEdge>
              </sdedi:SimpleDebugEditorDiagram>
            </sde:SimpleDebugEditorGraph>`;

            const transformer = new Diagram2JsonTransformer(); 
            let output : any = transformer.transform(xml);
            console.log(output);

            expect(output).to.be.an('object'); 
            expect(output.a).to.equal("12"); // shoud be a string
            expect(output.b).to.equal(45); // should be a number
            expect(output.c).to.be.an('object');
            expect(output.c.str).to.equal('this is c');

        });
    });
});