class Transformer {
    
    /**
     * transform the object of this class to an xml string
     */
    public transformJsonToDiagram(obj : object) : string {
        let result = '<?xml version="1.0" encoding="UTF-8"?>'; // add xml definition
        result = this.addLineBreakToString(result);
        //add root
        result += '<sde:SimpleDebugEditorGraph id="eg_1" xmlns:sde="https://seblog.cs.uni-kassel.de/sde" xmlns:sdedi="https://seblog.cs.uni-kassel.de/sdedi" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
        result = this.addLineBreakToString(result);
        

        //close root
        result += '</sde:SimpleDebugEditorGraph>';
        return result;
    }

    private addLineBreakToString(str : string) : string {
        return str += '\n';
    }

    public transformDiagramToJson(str : string) : object {
        return null;
    }

}

export default Transformer;