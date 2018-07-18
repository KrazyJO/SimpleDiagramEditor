
interface edge {
    sourceNode : string
    tragetNode : string
    sourceX : number
    sourceY : number
    targetX : number
    targetY : number
    nodeNumber : number
    nodeNumberTarget : number
    edgeid : number
}

interface Member {
    name : string
    propType : string
    value : any
}

class Transformer {
    

    private result : string;
    private diagram : string;
    private diagramInterchange : string;
    private nodeNumber : number;
    private edgeid : number;

    


    /**
     * transform the object of this class to an xml string
     */
    public transformJsonToDiagram(obj : object) : string {
        this.edgeid = 0,
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

    
    private transformObject(obj : object, name : string, level = 1, positionInLevel = 1 ) : void {
        let atomicTypes = ["string", "number", "boolean"];
        let edges : edge[] = [];
        let numberChildren : number = 0;
        
        //add node
        let nodeNumber = this.nodeNumber++;
        this.diagram += `<sde:Node id="node_${nodeNumber}" name="${name}">`;
        this.addLineBreakToDiagram();

        //write di (node -> shape)
        this.diagramInterchange += `<sdedi:SimpleDebugEditorShape id="shape_${nodeNumber}" simpleDebugEditorElement="node_${nodeNumber}">`;
        this.addLineBreakToDiagramInterchange();
        //calculate position
        let y = 100 * level + 50 * level;
        let x = 150 * positionInLevel + 50 * positionInLevel;
        this.diagramInterchange += `<dc:Bounds x="${x}" y="${y}" width="150" height="100" />`;
        this.addLineBreakToDiagramInterchange();

        //add object properties
        let keys = Object.keys(obj);
        let objectType = "";
        for (let i = 0; i < keys.length; i++)
        {
            objectType = typeof obj[keys[i]];
            //add atomic types as <sde:Member> to xml
            if ( atomicTypes.indexOf(objectType) > -1) {
                this.addMemberToDiagram({
                    name : keys[i],
                    propType : objectType,
                    value : obj[keys[i]]
                });
            } else if (objectType === 'object') {
                // other objects will be added to diagram xml and diagram interchange later
                // it's an edge
                numberChildren++;
                let nodeNumberTarget = nodeNumber + numberChildren;
                edges.push({
                    sourceNode : `node_${nodeNumber}`,
                    tragetNode : `node_${nodeNumberTarget}`,
                    sourceX : x+75, //+75 for center x
                    sourceY : y+100, //+100 for bottom
                    targetX : (100 * (level+numberChildren) + 50 * (level+numberChildren)),
                    targetY : (150 * (positionInLevel+1) + 50 * (positionInLevel+1)) - 100,
                    nodeNumber : nodeNumber,
                    nodeNumberTarget : nodeNumberTarget,
                    edgeid : ++this.edgeid
                });
            }
        }

        //close diagram
        this.diagram += '</sde:Node>'

        //close di
        this.diagramInterchange += '</sdedi:SimpleDebugEditorShape>';
        this.addLineBreakToDiagramInterchange();


        this.addLineBreakToDiagram();

        //add child objects to diagram
        numberChildren = 0;
        for (let i = 0; i < keys.length; i++)
        {
            if (typeof obj[keys[i]] === 'object') {
                this.transformObject(obj[keys[i]], keys[i], level +1, positionInLevel+numberChildren);
                numberChildren++;
            }
        }
        
        //add edges to diagram and diagram interchange
        edges.forEach(edge => {
            this.addEdge(edge);
        });
    }

    private addMemberToDiagram(options : Member) {
        this.diagram += `<sde:Member name="${options.name}" propType="${options.propType}" value="${options.value}"></sde:Member>`;
        this.addLineBreakToDiagram();
    }

    private addEdge(edge : edge) : void {
        //add to diagram
        // <sde:Edge id="edge_1" sourceNode="node_1" name="edge1" targetNode="node_2"></sde:Edge>
        this.diagram += `<sde:Edge id="edge_${edge.edgeid}" sourceNode="${edge.sourceNode}" name="edge${edge.edgeid}" targetNode="${edge.tragetNode}"></sde:Edge>`;
        this.addLineBreakToDiagram();
        //add to diagram interchange
        this.diagramInterchange += `<sdedi:SimpleDebugEditorEdge id="conn_${edge.edgeid}" simpleDebugEditorElement="edge_${edge.edgeid}" sourceElement="shape_${edge.nodeNumber}" targetElement="shape_${edge.nodeNumberTarget}">
<di:waypoint x="${edge.sourceX}" y="${edge.sourceY}" />
<di:waypoint x="${edge.targetX}" y="${edge.targetY}" />
</sdedi:SimpleDebugEditorEdge>`;
        this.addLineBreakToDiagramInterchange();
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