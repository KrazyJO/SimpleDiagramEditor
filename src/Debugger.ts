import EditorController from 'EditorController';
import Diagram2JsonTransformer from './transformer/Diagram2JsonTransformer';
import { Modeler } from 'Modeler';

interface debugComand {
    line : number
    command : string
}

class Debugger {

    private steps : debugComand[] = [];
    private currentSteps : debugComand[] =  [];
    private modeler : Modeler;
    private editorController : EditorController;

    public setEditorController(editorController : EditorController) {
        this.editorController = editorController;
    }

    public setModeler(modeler) {
        this.modeler = modeler;
    }

    /**
     * runs the whole application, no steps!
     * @param sJsCode the code to run
     */
    public run(sJsCode : string, sHtmlCode : string) : void {
        this.currentSteps = [];
        this.disableDebuggerButtons();
        this.injectCode(sJsCode, sHtmlCode);
    }

    /**
     * debugs the application
     * Functions can be debugged, the function itself will be async.
     * Before each command, the application awaits a promise -> so we can
     * stop inside the application. The body of the function to debug 
     * will be replaced with this promise-stoped execution.
     * LIMITATIONS:
     * The Body of the function to debug may not contain '}'.
     * Because of this, loops and other functions using this character are not allowed
     * @param {string} sJsCode the code to debug
     * @param {string} sHtmlCode the html code to inject
     */
    public debug(sJsCode : string, sHtmlCode : string) : void {
        //button will be enabled when function to debug is called
        this.disableDebuggerButtons();
        // this.decorations = [];
        this.editorController.setDecorations([]);

        //sJsCode.match(regex) would deliver all matches (more than one function)

        var regex = /\/\/@debug\s*function\s(.*)\s*\(([a-zA-Z,]*)\)\s*{\s*([^\}]*]*)}/g;
        var matches = regex.exec(sJsCode);
        // matches[0] => whole function
        // matches[1] => function name
        // matches[2] => function arguments
        // matches[3] => function body
        if (matches) {
            let fnArguments = matches[2];
            var iStart : number = matches.index;
            var iEnd : number = iStart + matches[0].length;
            var sSubstring : string = sJsCode.substr(iStart, matches[0].length);

            const textBeforeFunctionToDebug = sJsCode.substr(0, iStart);

            //codeToDebug is the body of the function
            var codeToDebug = matches[3];
            // var commands = codeToDebug.replace(/\s/g, '').split(';');

            //we just want to split \n to get the lines for code highlighting
            var lines = codeToDebug.replace(/\t/g, '').replace(/\r/g,'').split(/\n/);

            var linesUntilStart = textBeforeFunctionToDebug.split(/\r\n|\r|\n/).length + 1;
            
            //post message to parent to activate the debugger ;)
            var sPromise, i = 0, debuggerSteps = [];
            var activatePromises=
            `
            function activatePromises() {
            `;
            var body = `
            
            var promise = new Promise(function(resolve, reject) {
                window['firstResponsePromiseResolve'] = resolve;
            });
            parent.postMessage('debugger:activate', parent.location.origin);
            await promise;
            `;
            


            var lineCommands;
            lines.forEach( line => {
                linesUntilStart++;
                lineCommands = line.split(';');
                //create one promise per command
                lineCommands.forEach(command => {
                    if (command) {
                        i++;
                        sPromise += `
                        var promiseResolve${i};
                        var promiseReject${i};
                        var promise${i};
                        `;
                        activatePromises +=
                        `
                            promise${i} = new Promise(function(resolve, reject){
                                promiseResolve${i} = resolve;
                                promiseReject${i} = reject;
                            });
                        `
                        body += `
                        await promise${i};
                        ${command}
                        `
                        debuggerSteps.push({line: linesUntilStart, command: `promiseResolve${i}`});
                    }
                });
            });

            activatePromises += `
            }
            `;
            //make function inside application async to play with promises
            sSubstring = 'async function ' + matches[1] + '('+fnArguments+') {' + body + '}';

            //set the steps to execute to let code run
            this.steps = debuggerSteps;
            
            //build together the whole code with debug function
            sJsCode = sPromise + activatePromises + textBeforeFunctionToDebug + sSubstring + sJsCode.substr(iEnd);
        }

        this.injectCode(sJsCode, sHtmlCode);
    }

    public activate() : void {
        if (this.steps.length) {
            Object.assign(this.currentSteps, this.steps);
            this.enableDebuggerButtons();
            this.highlightLine(this.currentSteps[0].line);
            const prev : any = document.getElementById('preview');
            if (prev) {
                prev.contentWindow['activatePromises'].call(prev.contentWindow);
                prev.contentWindow['firstResponsePromiseResolve'].call(prev.contentWindow);
            }
            this.modeler.updateFromIframeModel();
        }
    }

    /**
     * @param line line number to highlight in editor
     */
    private highlightLine(line : number) {
        this.editorController.highlightLine(line);
    }

    public async doStep() {
        this.disableDebuggerButtons();
        
        //interact and step runs asyc :(
        await this.modeler.interactWithModdle(this.injectModdleBackToApplication);
        this.step();
    
        //cannot catch proise resolve from within iframe
        //so this is an ugly solution, but it works :(
        setTimeout(function() {
    
            if (!this.isRunning()) {
                //clear after all steps are done
                this.modeler.clear();
            } else {
                //update moddle from diagram changes...
                this.enableDebuggerButtons();
                this.modeler.updateFromIframeModel();
            
            }
        }.bind(this),100);
        
    }

    /**
     * do one debugger step
     */
    private step() : void {
        let sFunctionName : debugComand = this.currentSteps.shift();
        if (sFunctionName) {
            this.executeRemote(sFunctionName.command);
            if (this.currentSteps.length > 0)
            {
                this.highlightLine(this.currentSteps[0].line);
            }
        } 

        //was it the last step? disable button
        if (this.currentSteps.length === 0)
        {
            this.disableDebuggerButtons();
            this.highlightLine(0);
        }
    }

    /**
     * transforms current diagram moddle object and replaces it with 'rootModle' in application
     * @param xml diagram xml string
     */
    private injectModdleBackToApplication(xml: string) {
        let oDiagram2JsonTransformer = new Diagram2JsonTransformer();
        let rootObject = oDiagram2JsonTransformer.transform(xml);
        if (rootObject) {
            const prev = <HTMLIFrameElement>document.getElementById('preview');
            prev.contentWindow["rootModle"] = rootObject;
        }
    
    }

    /**
     * do all steps
     */
    public async runAll() {
        await this.modeler.interactWithModdle(this.injectModdleBackToApplication);

        while(this.currentSteps.length) {
            this.step();
        }
    
        this.disableDebuggerButtons();

        this.modeler.clear();
    }

    public isRunning() : boolean {
        return this.currentSteps.length > 0;
    }

    /**
     * @param steps array of the steps
     */
    public setSteps(steps : debugComand[]) : void {
        this.currentSteps = steps;
    }

    /**
     * adds one step on the step-stack
     * @param step function name of the step
     */
    public addStep(step : debugComand) : Debugger {
        this.currentSteps.push(step);
        return this;
    }

    private executeRemote(sFunctionName : string) : void {
        const prev : any = document.getElementById('preview');
        if (prev.contentWindow[sFunctionName] && typeof prev.contentWindow[sFunctionName] === "function") {
            prev.contentWindow[sFunctionName].call(prev.contentWindow[sFunctionName]);
        }
    }

    /**
     * injects html and js code to the iframe
     * @param sJsCode code from js tab
     * @param sHtmlCode code from html tab
     */
    private injectCode(sJsCode : string, sHtmlCode : string) : void {
        const prev : any = document.getElementById('preview');
        if (prev) {
            let indexOfString = sHtmlCode.indexOf('<head>');
            let sSrcDoc = sHtmlCode;
           
            if (indexOfString >= 0) {
                sSrcDoc = sSrcDoc.slice(0,indexOfString+6)+ `<script>${sJsCode}</script>`+sSrcDoc.slice(indexOfString+6);
            } else {
                //no head, test <html> tag
                indexOfString = sHtmlCode.indexOf('<html>');
                if (indexOfString >= 0) {
                    sSrcDoc = sSrcDoc.slice(0,indexOfString+6)+ `<head><script>${sJsCode}</script></head>`+sSrcDoc.slice(indexOfString+6);
                } else {
                    sSrcDoc = `<script>${sJsCode}</script>`;
                }
            }
            
            prev.setAttribute('srcdoc', sSrcDoc);
        }
    }

    public enableDebuggerButtons() {
        this.seteButtonState(true);
    }

    public disableDebuggerButtons() {
        this.seteButtonState(false);
    }

    private seteButtonState(debugModeEnabled : boolean) {
        let btn : any = document.getElementById('btnStep');
        btn.disabled = !debugModeEnabled;

        let btnRunAll : any = document.getElementById('btnRunAll');
        btnRunAll.disabled = !debugModeEnabled;

        let btnDownloadModel : any = document.getElementById('btnDownloadModel');
        btnDownloadModel.disabled = !debugModeEnabled;

        // when application is in debugging, button run and debug
        // have to be disabled

        let btnDebug : any = document.getElementById('btnDebug');
        btnDebug.disabled = debugModeEnabled;

        let btnRun : any = document.getElementById('btnRun');
        btnRun.disabled = debugModeEnabled;
    }

    public runCode() {
        let oEditorController = this.editorController;
        //update current editor code
        if (oEditorController.getActiveTab() === 'Html') {
            oEditorController.setHtmlCode(oEditorController.getEditor().getValue());
        } else if (oEditorController.getActiveTab() === 'Js') {
            oEditorController.setJsCode(oEditorController.getEditor().getValue())
        }
    
    
        this.run(oEditorController.getJsContent(), oEditorController.getHtmlContent());
        this.modeler.clear();
    }

    public debugCode() {
        let oEditorController = this.editorController;
        // oDebugger.debug(myEditor.getValue());
        if (oEditorController.getActiveTab() === 'Html') {
            oEditorController.setHtmlCode(oEditorController.getEditor().getValue());
        } else if (oEditorController.getActiveTab() === 'Js') {
            oEditorController.setJsCode(oEditorController.getEditor().getValue())
        }
    
        this.debug(oEditorController.getJsContent(), oEditorController.getHtmlContent());
        if (!this.isRunning()) {
            this.modeler.clear();
        }
    }
}

export default Debugger;