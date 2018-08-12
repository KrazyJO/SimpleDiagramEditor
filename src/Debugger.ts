class Debugger {

    private steps : string[] =  [];

    /**
     * runs the whole application, no steps!
     * @param sJsCode the code to run
     */
    public run(sJsCode : string, sHtmlCode : string) : void {
        this.steps = ['step1', 'step2', 'step3'];
        
        this.enableDebuggerButtons();

        // var regex = /\/\/@debug\s*function\s(.*)\s*\(\)\s*{([^\}]*]*)}/;
        // var matches = regex.exec(sJsCode);
        // if (matches) {
        //     var iStart : number = sJsCode.indexOf(matches[0]);
        //     var iEnd : number = iStart + matches[0].length;
        //     var sSubstring : string = sJsCode.substr(iStart, matches[0].length);

        //     sSubstring = 'function ' + matches[1] + '() {' + '/*new body*/' + '}';

        //     var codeToDebug = matches[2];
        //     var commands = codeToDebug.replace(/\s/g, '').split(';');

        //     var sPromise, i = 0, body = "", debuggerSteps = [];
        //     commands.forEach(command => {
        //         i++;
        //         sPromise += `
        //         var promiseResolve${i};
        //         var promiseReject${i};
                
        //         var promise${i} = new Promise(function(resolve, reject){
        //             promiseResolve${i} = resolve;
        //             promiseReject${i} = reject;
        //         });
        //     `;
        //     body += `
        //     await promise${i};
        //     `
        //     debuggerSteps.push(`promise${i}`);
        //     });
        //     this.steps = debuggerSteps;
            

        //     sJsCode = sPromise + sJsCode.substr(0, iStart) + sSubstring + sJsCode.substr(iEnd);

            
        //     console.log(commands);
        // }

        // console.log(regex);

        this.injectCode(sJsCode, sHtmlCode);
        setTimeout(function() {
            this.runAll();
        }.bind(this),500);
    }

    /**
     * debugs the application
     * @param sJsCode the code to debug
     */
    public debug(sJsCode : string, sHtmlCode : string) : void {
        // this.steps = ['step1', 'step2', 'step3'];
        // this.enableDebuggerButtons();
        this.disableDebuggerButtons();

        var regex = /\/\/@debug\s*function\s(.*)\s*\(\)\s*{([^\}]*]*)}/;
        var matches = regex.exec(sJsCode);
        if (matches) {
            var iStart : number = sJsCode.indexOf(matches[0]);
            var iEnd : number = iStart + matches[0].length;
            var sSubstring : string = sJsCode.substr(iStart, matches[0].length);

            var codeToDebug = matches[2];
            var commands = codeToDebug.replace(/\s/g, '').split(';');

            var sPromise, i = 0, body = "parent.postMessage('debugger:activate', parent.location.origin);", debuggerSteps = [];
            commands.forEach(command => {
                if (command) {
                    i++;
                    sPromise += `
                    var promiseResolve${i};
                    var promiseReject${i};
                    
                    var promise${i} = new Promise(function(resolve, reject){
                        promiseResolve${i} = resolve;
                        promiseReject${i} = reject;
                    });
                    `;
                    body += `
                    await promise${i};
                    ${command}
                    `
                    debuggerSteps.push(`promiseResolve${i}`);
                }
            });

            sSubstring = 'async function ' + matches[1] + '() {' + body + '}';

            this.steps = debuggerSteps;
            

            sJsCode = sPromise + sJsCode.substr(0, iStart) + sSubstring + sJsCode.substr(iEnd);

            
            console.log(commands);
        }

        this.injectCode(sJsCode, sHtmlCode);
    }

    public activate() : void {
        this.enableDebuggerButtons();
    }

    /**
     * do one debugger step
     */
    public step() : void {
        let sFunctionName : string = this.steps.shift();
        if (sFunctionName) {
            this.executeRemote(sFunctionName);
        } 

        //was it the last step? disable button
        if (this.steps.length === 0)
        {
            this.disableDebuggerButtons();
        }
    }

    /**
     * do all steps
     */
    public runAll() : void {
        for (let i = 0; i < this.steps.length; i++)
        {
            this.executeRemote(this.steps[i]);
        }
    
        this.disableDebuggerButtons();
    
        this.steps = [];
    }

    public isRunning() : boolean {
        return this.steps.length > 0;
    }

    /**
     * @param steps array of the steps
     */
    public setSteps(steps : string[]) : void {
        this.steps = steps;
    }

    /**
     * adds one step on the step-stack
     * @param step function name of the step
     */
    public addStep(step : string) : Debugger {
        this.steps.push(step);
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

    private enableDebuggerButtons() {
        let btn : any = $('#btnStep')[0];
        btn.disabled = false;

        let btnRunAll : any = $('#btnRunAll')[0];
        btnRunAll.disabled = false;
    }

    private disableDebuggerButtons() {
        let btn : any = $('#btnStep')[0];
        btn.disabled = true;

        let btnRunAll : any = $('#btnRunAll')[0];
        btnRunAll.disabled = true;
    }


}

export default Debugger;