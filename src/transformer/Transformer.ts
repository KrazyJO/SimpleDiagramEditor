class Transformer {
    

    private result : string;

    /**
     * transform the object of this class to an xml string
     */
    public transformJsonToDiagram(obj : object) : string {
        this.result = '<?xml version="1.0" encoding="UTF-8"?>'; // add xml definition
        this.addLineBreakToResult();
        //add root
        this.result += '<sde:SimpleDebugEditorGraph id="eg_1" xmlns:sde="https://seblog.cs.uni-kassel.de/sde" xmlns:sdedi="https://seblog.cs.uni-kassel.de/sdedi" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
        this.addLineBreakToResult(); 
        
        this.result += this.transformObject(obj, 'root');

        //close root
        this.result += '</sde:SimpleDebugEditorGraph>';
        return this.result;
    }

    private transformObject(obj : object, name : string) : string {
        //add node
        let innerResult = `<sde:Node id="node_1" name="${name}">`;
        innerResult = this.addLineBreakToString(innerResult);
        
        let keys = Object.keys(obj);
        
        for (let i = 0; i < keys.length; i++)
        {
            if (typeof obj[keys[i]] === 'number' ) {
                innerResult += `<sde:members>
${keys[i]}
</sde:members>`
                innerResult += '\n';
            } else if (typeof obj[keys[i]]  === 'string' ) {
                innerResult += `<sde:members>
${keys[i]}
</sde:members>`
                innerResult += '\n';
            } else if (typeof (obj[keys[i]] === 'boolean')) {

            }
            else if (typeof obj[keys[i]] === 'object') {

            }
        }
        innerResult += '</sde:Node>'
        innerResult = this.addLineBreakToString(innerResult);
        return innerResult;
    }

    private addLineBreakToResult() {
        this.result += '\n';
    }

    private addLineBreakToString(str : string) : string {
        return str += '\n';
    }

    public transformDiagramToJson(str : string) : object {
        return null;
    }

}

export default Transformer;