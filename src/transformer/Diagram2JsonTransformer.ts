interface objNode {
    id : string
    name : string
    obj : object
}

class Diagram2JsonTransformer {

    private allObjects : objNode[] = [];

    /**
     * transforms a sde-diagram to an object
     * @param str xml string
     */
    public transform(str : string) : object {
        //(re)initialize
        this.allObjects = [];
        // convert str to xml document
        let xml = (new DOMParser()).parseFromString(str, "text/xml");
        // console.log(xml);

        // yes, unessassary. But extendable...
        let node;
        for (let i = 0; i < xml.children.length; i++)
        {
            if (xml.children[i].tagName === "sde:SimpleDebugEditorGraph")
            {
                for (let j = 0; j < xml.children[i].children.length; j++)
                {
                    node = xml.children[i].children[j];
                    switch (node.tagName) {
                        case 'sde:Node':
                            this.transformNode(node);
                            break;
                        case 'sde:Edge':
                            this.handleEdge(node);
                            break;
                        default:
                            console.log("not implemented yet: " + node.tagName);
                            break;
                    }
                }
            }
        }

        // console.log(this.allObjects);
        //return 
        return this.findNodeWithName('root').obj || null;
    }

    private handleEdge(node) : void {
        let sourceNodeId = node.getAttribute('sourceNode');
        let targetNodeId = node.getAttribute('targetNode');
        //find source
        let sourceNode = this.findNodeWithId(sourceNodeId);
        if (!sourceNode)
        {
            //was removed from diagram
            return;
        }

        //find target
        let targetNode = this.findNodeWithId(targetNodeId);
        if (!targetNode)
        {
            //was removed from diagram
            return;
        }

        //add targetNode as property in sourceNode with its name
        sourceNode.obj[targetNode.name] = targetNode.obj;
    }

    private findNodeWithId(id : string) : objNode {
        let returnNode;
        this.allObjects.forEach((element : any) => {
            if (element.id === id)
            {
                returnNode = element;
            }
        });
        return returnNode || null;
    }
    
    private findNodeWithName(name : string) : objNode {
        let returnNode;
        this.allObjects.forEach((element : any) => {
            if (element.name === name)
            {
                returnNode = element;
            }
        });
        return returnNode || null;
    }

    private transformNode(node) : void {
        let obj : any = {
            id : node.getAttribute('id'),
            name : node.getAttribute('name')
        };

        let sClass = node.getAttribute("class")

        if (sClass === 'Object' || sClass === null) {
            obj.obj = {};
        } else {
            // baaaad....
            var prev = <any>document.getElementById('preview');
            let createdObject = prev.contentWindow.eval('new ' + sClass);
            if (createdObject) {
                obj.obj = createdObject;
            } else {
                throw 'constructor "'+ node.getAttribute("class") +'" could not be called inside preview :(';
            }

        }

        // add properties to object
        let aMembers = node.getElementsByTagName('sde:Member');
        let member;
        for (let i = 0; i < aMembers.length; i++)
        {
            member = aMembers[i];
            let propName = member.getAttribute("name");
            let value : any = member.getAttribute("value")
            let propType = member.getAttribute("propType");
            switch (propType) {
                case "boolean":
                    if (value === 'true') {
                        obj.obj[propName] = true;
                    } else {
                        obj.obj[propName] = false;
                    }
                    break;
                case "number":
                    value = Number(value);
                    if (isNaN(value)) {
                        obj.obj[propName] = NaN;
                    } else {
                        obj.obj[propName] = value;
                    }
                    break;
                case "string": 
                    obj.obj[propName] = value;
                    break;
                default:
                    console.error("this propType is not implemented: " + propType);
                    break;
            }
        }

        this.allObjects.push(obj);

    }

}

export default Diagram2JsonTransformer;