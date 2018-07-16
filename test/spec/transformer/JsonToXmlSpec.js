import Transformer from '../../../src/transformer/Transformer';

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
                b : 45
            };

            //yes, it is ugly...
            const expectedResult = 
`<?xml version="1.0" encoding="UTF-8"?>
<sde:SimpleDebugEditorGraph id="eg_1" xmlns:sde="https://seblog.cs.uni-kassel.de/sde" xmlns:sdedi="https://seblog.cs.uni-kassel.de/sdedi" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
</sde:SimpleDebugEditorGraph>`;
            
            let oTransformer = new Transformer();
            let result = oTransformer.transformJsonToDiagram(oObjectToTransform);
            expect(result).to.equal(expectedResult);
        });

    });

});