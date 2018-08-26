
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
    name? : string
}

interface Member {
    name : string
    propType : string
    value? : any
}

interface Node {
    obj : object
    name : string
    level : number
    positionInLevel : number
    nodeNumber : number
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
        
        this.transformObject(obj, 'root', 0, 0, 0);
        this.result += this.diagram;

        //write di
        this.diagramInterchange += '</sdedi:SimpleDebugEditorDiagram>';
        this.addLineBreakToDiagramInterchange();
        this.result += this.diagramInterchange;

        //close root
        this.result += '</sde:SimpleDebugEditorGraph>';
        return this.result;
    }

    
    private transformObject(obj : object, name : string, level = 1, positionInLevel = 0, nodeNumber ) : number {
        let atomicTypes = ["string", "number", "boolean"];
        let edges : edge[] = [];
        let children : Node[] = [];
        let numberChildren : number = 0;
        let className : string = obj.constructor.name;
        let thisNodeNumber= nodeNumber;
        
        //add node
        // let nodeNumber = this.nodeNumber++;
        this.diagram += `<sde:Node id="node_${nodeNumber}" name="${name}" class="${className}">`;
        this.addLineBreakToDiagram();

        //write di (node -> shape)
        this.diagramInterchange += `<sdedi:SimpleDebugEditorShape id="shape_${nodeNumber}" simpleDebugEditorElement="node_${nodeNumber}">`;
        this.addLineBreakToDiagramInterchange();
        //calculate position
        let x = 150 * positionInLevel + 50 * positionInLevel;
        let y = 100 * level + 50 * level;
        this.diagramInterchange += `<dc:Bounds x="${x}" y="${y}" width="150" height="100" />`;
        this.addLineBreakToDiagramInterchange();

        //add object properties
        let keys = Object.keys(obj);
        let objectType = "";
        let nodeNumberTarget;
        let currentObject, currentKey;
        for (let i = 0; i < keys.length; i++)
        {
            currentObject = obj[keys[i]];
            currentKey = keys[i];
            if (Array.isArray(currentObject)) {
                objectType = 'array';
            }
            else {
                objectType = typeof currentObject;
            }
            
            //add atomic types as <sde:Member> to xml
            if ( atomicTypes.indexOf(objectType) > -1) {
                this.addMemberToDiagram({
                    name : currentKey,
                    propType : objectType,
                    value : currentObject
                });
            } else if (objectType === 'array') {
                this.addMemberToDiagram({
                    name : currentKey,
                    propType : 'Array'
                });
                let arrayObject, arrayKey;
                for (let j = 0; j < currentObject.length; j++) {
                    arrayObject = currentObject[j];
                    arrayKey = currentKey + `[${j}]`;

                    nodeNumberTarget = ++this.nodeNumber;
                    children.push({
                        obj : arrayObject,
                        name : currentKey,
                        level : level +1,
                        positionInLevel : positionInLevel+numberChildren,
                        nodeNumber : nodeNumberTarget
                    });
                    edges.push({
                        sourceNode : `node_${thisNodeNumber}`,
                        tragetNode : `node_${nodeNumberTarget}`,
                        sourceX : x+75, //+75 for center x
                        sourceY : y+100, //+100 for bottom
                        targetX : (150 * (positionInLevel+(numberChildren+1)) + 50 * (positionInLevel+(numberChildren+1))) - 125,
                        targetY : (100 * (level+1) + 50 * (level+1)),
                        nodeNumber : thisNodeNumber,
                        nodeNumberTarget : nodeNumberTarget,
                        edgeid : ++this.edgeid,
                        name : arrayKey
                    });

                    numberChildren++;
                }
            } else if (objectType === 'object') {
                // other objects will be added to diagram xml and diagram interchange later
                nodeNumberTarget = ++this.nodeNumber;
                children.push({
                    obj : currentObject,
                    name : currentKey,
                    level : level +1,
                    positionInLevel : positionInLevel+numberChildren,
                    nodeNumber : nodeNumberTarget
                });
                edges.push({
                    sourceNode : `node_${thisNodeNumber}`,
                    tragetNode : `node_${nodeNumberTarget}`,
                    sourceX : x+75, //+75 for center x
                    sourceY : y+100, //+100 for bottom
                    targetX : (150 * (positionInLevel+(numberChildren+1)) + 50 * (positionInLevel+(numberChildren+1))) - 125,
                    targetY : (100 * (level+1) + 50 * (level+1)),
                    nodeNumber : thisNodeNumber,
                    nodeNumberTarget : nodeNumberTarget,
                    edgeid : ++this.edgeid,
                    name : currentKey
                });

                numberChildren++;
            }
        }

        //close diagram
        this.diagram += '</sde:Node>'

        //close di
        this.diagramInterchange += '</sdedi:SimpleDebugEditorShape>';
        this.addLineBreakToDiagramInterchange();


        this.addLineBreakToDiagram();

        // add children
        children.forEach(child => {
            this.transformObject(child.obj, child.name, child.level, child.positionInLevel, child.nodeNumber);
        });

        //add edges to diagram and diagram interchange
        edges.forEach(edge => {
            this.addEdge(edge);
        });

        return nodeNumber;
    }

    private addMemberToDiagram(options : Member) {
        this.diagram += `<sde:Member name="${options.name}" propType="${options.propType}" value="${options.value}"></sde:Member>`;
        this.addLineBreakToDiagram();
    }

    private addEdge(edge : edge) : void {
        //add to diagram
        // <sde:Edge id="edge_1" sourceNode="node_1" name="edge1" targetNode="node_2"></sde:Edge>
        this.diagram += `<sde:Edge id="edge_${edge.edgeid}" sourceNode="${edge.sourceNode}" name="${edge.name}" targetNode="${edge.tragetNode}"></sde:Edge>`;
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

    /**
     * obsolet
     * @param str sdf
     */
    public transformDiagramToJson(str : string) : object {
        // convert str to xml document
        let xml = (new DOMParser).parseFromString(str, "text/xml");
        console.log(xml);
        return null;
        
    }

}

export default Transformer;