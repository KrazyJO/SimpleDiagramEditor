class Transformer {
    

    private result : string;
    private diagram : string;
    private diagramInterchange : string;
    private nodeNumber : number;


    /**
     * transform the object of this class to an xml string
     */
    public transformJsonToDiagram(obj : object) : string {
        this.nodeNumber = 1;
        this.diagramInterchange = '<sdedi:SimpleDebugEditorDiagram id="ed_1">';
        this.addLineBreakToDiagramInterchange()
        this.diagram = '';
        this.result = '<?xml version="1.0" encoding="UTF-8"?>'; // add xml definition
        this.addLineBreakToResult();
        //add root
        this.result += '<sde:SimpleDebugEditorGraph id="eg_1" xmlns:sde="https://seblog.cs.uni-kassel.de/sde" xmlns:sdedi="https://seblog.cs.uni-kassel.de/sdedi" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
        this.addLineBreakToResult(); 
        
        this.transformObject(obj, 'root');
        this.result += this.diagram;

        //write di
        this.diagramInterchange += '</sdedi:SimpleDebugEditorDiagram>';
        this.addLineBreakToDiagramInterchange();
        this.result += this.diagramInterchange;

        //close root
        this.result += '</sde:SimpleDebugEditorGraph>';
        return this.result;
    }

    private transformObject(obj : object, name : string) : void {
        //add node
        let nodeNumber = this.nodeNumber++;
        this.diagram += `<sde:Node id="node_${nodeNumber}" name="${name}">`;
        this.addLineBreakToDiagram();

        //write di (node -> shape)
        this.diagramInterchange += `<sdedi:SimpleDebugEditorShape id="shape_${nodeNumber}" simpleDebugEditorElement="node_${nodeNumber}">`;
        this.addLineBreakToDiagramInterchange();
        this.diagramInterchange += '<dc:Bounds x="500" y="200" width="150" height="100" />'
        this.addLineBreakToDiagramInterchange();

        //add object properties
        let keys = Object.keys(obj);
        
        for (let i = 0; i < keys.length; i++)
        {
            if (typeof obj[keys[i]] === 'number' ) {
                this.diagram += `<sde:members>
${keys[i]}
</sde:members>`
                this.addLineBreakToDiagram();
            } else if (typeof obj[keys[i]]  === 'string' ) {
                this.diagram += `<sde:members>
${keys[i]}
</sde:members>`
                this.addLineBreakToDiagram();
            } else if (typeof (obj[keys[i]] === 'boolean')) {

            }
            else if (typeof obj[keys[i]] === 'object') {

            }
        }

        //close diagram
        this.diagram += '</sde:Node>'

        //close di
        this.diagramInterchange += '</sdedi:SimpleDebugEditorShape>';
        this.addLineBreakToDiagramInterchange();


        this.addLineBreakToDiagram();

        //add more objects to diagram
        for (let i = 0; i < keys.length; i++)
        {
            if (typeof obj[keys[i]] === 'object') {
                this.transformObject(obj[keys[i]], keys[i]);
            }
        }
    }

    private addLineBreakToResult() {
        this.result += '\n';
    }

    private addLineBreakToDiagram() {
        this.diagram += '\n';
    }

    private addLineBreakToDiagramInterchange() {
        this.diagramInterchange += '\n';
    }

    // private addLineBreakToString(str : string) : string {
    //     return str += '\n';
    // }

    public transformDiagramToJson(str : string) : object {
        return null;
    }

}

export default Transformer;