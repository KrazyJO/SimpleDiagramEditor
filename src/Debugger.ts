class Debugger {

    private steps : string[] =  [];

    /**
     * runs the whole application, no steps!
     * @param sJsCode the code to run
     */
    public run(sJsCode : string, sHtmlCode : string) : void {
        this.steps = ['step1', 'step2', 'step3'];
        
        this.enableDebuggerButtons();
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
        this.steps = ['step1', 'step2', 'step3'];
        this.enableDebuggerButtons();
        this.injectCode(sJsCode, sHtmlCode);
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
            prev.contentWindow[sFunctionName].call(prev.contentWindow);
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
            let indexOfHead = sHtmlCode.indexOf('<head>');
            let sSrcDoc = sHtmlCode;
           
            if (indexOfHead >= 0) {
                sSrcDoc = sSrcDoc.slice(0,indexOfHead+6)+ `<script>${sJsCode}</script>`+sSrcDoc.slice(indexOfHead+6);
            } else {
                sSrcDoc = `<script>${sJsCode}</script>`;
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