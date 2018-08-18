import {Range as monacoRange} from 'monaco-editor';


interface debugComand {
    line : number
    command : string
}

class Debugger {

    private steps : debugComand[] = [];
    private currentSteps : debugComand[] =  [];
    private editor;
    private decorations;
    private modeler;


    public setEditor(editor) {
        this.editor = editor;
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
        this.decorations = [];

        //sJsCode.match(regex) would deliver all matches (more than one function)

        var regex = /\/\/@debug\s*function\s(.*)\s*\(\)\s*{\s*([^\}]*]*)}/g;
        var matches = regex.exec(sJsCode);
        if (matches) {
            var iStart : number = matches.index;
            var iEnd : number = iStart + matches[0].length;
            var sSubstring : string = sJsCode.substr(iStart, matches[0].length);

            const textBeforeFunctionToDebug = sJsCode.substr(0, iStart);

            //codeToDebug is the body of the function
            var codeToDebug = matches[2];
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
            sSubstring = 'async function ' + matches[1] + '() {' + body + '}';

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
        if (line === 0) {
            line = -1;
        }
        this.decorations = this.editor.deltaDecorations(this.decorations, [
            { range: new monacoRange(line,1,line,1),
                options: {
                    isWholeLine: true,
                    className: 'myContentClass'
                }
            }
        ]);
    }

    /**
     * do one debugger step
     */
    public step() : void {
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
     * do all steps
     */
    public runAll() : void {
        while(this.currentSteps.length) {
            this.step();
        }
    
        this.disableDebuggerButtons();
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
        let btn : any = $('#btnStep')[0];
        btn.disabled = false;

        let btnRunAll : any = $('#btnRunAll')[0];
        btnRunAll.disabled = false;

        let btnDownloadModel : any = $('#btnDownloadModel')[0];
        btnDownloadModel.disabled = false;
    }

    public disableDebuggerButtons() {
        let btn : any = $('#btnStep')[0];
        btn.disabled = true;

        let btnRunAll : any = $('#btnRunAll')[0];
        btnRunAll.disabled = true;

        let btnDownloadModel : any = $('#btnDownloadModel')[0];
        btnDownloadModel.disabled = false;
    }


}

export default Debugger;