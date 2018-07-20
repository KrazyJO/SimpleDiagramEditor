class Debugger {

    private steps : string[] =  [];

    /**
     * runs the whole application, no steps!
     * @param sCode the code to run
     */
    public run(sCode : string) : void {
        this.steps = [];
        
        this.enableDebuggerButtons();
        this.injectCode(sCode);
        setTimeout(function() {
            this.runAll();
        }.bind(this),500);
    }

    /**
     * debugs the application
     * @param sCode the code to debug
     */
    public debug(sCode : string) : void {
        this.steps = ['step1', 'step2', 'step3'];
        this.enableDebuggerButtons();
        this.injectCode(sCode);
    }

    /**
     * do one debugger step
     */
    public step() : void {
        let sFunctionName : string = this.steps.shift();
        if (sFunctionName) {
            const prev : any = document.getElementById('preview');
            prev.contentWindow.doStep(sFunctionName);
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
        const prev : any = document.getElementById('preview');
        for (let i = 0; i < this.steps.length; i++)
        {
            prev.contentWindow.doStep(this.steps[i]);
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

    private injectCode(sCode : string) {
        const prev = document.getElementById('preview');
        if (prev) {
            prev.setAttribute('srcdoc', `<script>${sCode}</script>`);
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