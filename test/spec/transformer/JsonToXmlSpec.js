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
            
            let oTransformer = new Transformer();
            let result = oTransformer.transformJsonToDiagram(oObjectToTransform);
            expect(result).to.equal('abc');
        });

    });

});