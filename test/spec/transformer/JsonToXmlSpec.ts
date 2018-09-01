import Transformer from '../../../src/transformer/Transformer';

import { expect } from "chai";
var chai = require('chai');
chai.use(require('sinon-chai')); 

describe('transformer', () => {

    describe('initialize', () => {

        it('should be initialized with and without object', () => {

            let oTransformer = new Transformer();
            expect(oTransformer).to.be.an('object');
            expect(oTransformer.transformDiagramToJson).to.be.an('function');
            expect(oTransformer.transformJsonToDiagram).to.be.an('function');

            

        });

        it('should transform object to simple diagram string', () => {
            let oObjectToTransform = {
                a : "12",
                b : 45,
                c : {
                    d : "42"
                }
            };

            //yes, it is ugly...
            const expectedResult = 
`<?xml version="1.0" encoding="UTF-8"?>
<sde:SimpleDebugEditorGraph id="eg_1" xmlns:sde="https://seblog.cs.uni-kassel.de/sde" xmlns:sdedi="https://seblog.cs.uni-kassel.de/sdedi" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<sde:Node id="node_0" name="root" class="Object">
<sde:Member name="a" propType="string" value="12"></sde:Member>
<sde:Member name="b" propType="number" value="45"></sde:Member>
</sde:Node>
<sde:Node id="node_2" name="c" class="Object">
<sde:Member name="d" propType="string" value="42"></sde:Member>
</sde:Node>
<sde:Edge id="edge_1" sourceNode="node_0" name="c" targetNode="node_2"></sde:Edge>
<sdedi:SimpleDebugEditorDiagram id="ed_1">
<sdedi:SimpleDebugEditorShape id="shape_0" simpleDebugEditorElement="node_0">
<dc:Bounds x="0" y="0" width="150" height="100" />
</sdedi:SimpleDebugEditorShape>
<sdedi:SimpleDebugEditorShape id="shape_2" simpleDebugEditorElement="node_2">
<dc:Bounds x="0" y="150" width="150" height="100" />
</sdedi:SimpleDebugEditorShape>
<sdedi:SimpleDebugEditorEdge id="conn_1" simpleDebugEditorElement="edge_1" sourceElement="shape_0" targetElement="shape_2">
<di:waypoint x="75" y="100" />
<di:waypoint x="75" y="150" />
</sdedi:SimpleDebugEditorEdge>
</sdedi:SimpleDebugEditorDiagram>
</sde:SimpleDebugEditorGraph>`;
            
            let oTransformer = new Transformer();
            let result = oTransformer.transformJsonToDiagram(oObjectToTransform);
            expect(result).to.equal(expectedResult);
        });

    });

});