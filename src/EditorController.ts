import * as monaco from 'monaco-editor';

interface editorContent {
    editorValue : string
    editorScrollHeight : number
}

class EditorController {

    private editor : monaco.editor.IStandaloneCodeEditor;
    private jsContent : editorContent;
    private htmlContent : editorContent;
    private activeTab : string = 'Js';

    constructor() {
        this.htmlContent = {
            editorScrollHeight : 0,
            editorValue : ""
        }
        this.jsContent = {
            editorScrollHeight : 0,
            editorValue : ""
        }
    }

    public initializeEditor() : monaco.editor.IStandaloneCodeEditor {
        const editorContainer = document.getElementById('editor');
        let myEditor : monaco.editor.IStandaloneCodeEditor = null;
        if (editorContainer) {
            // let demoCodeJs = require('./demoCode/app.txt');
            // let demoCodeHtml = require('./demoCode/html.txt');
            let demoCodeJs = require('./demoCode/bbqapp.txt');
            let demoCodeHtml = require('./demoCode/bbqhtml.txt');
            this.setHtmlCode(demoCodeHtml);
            this.setJsCode(demoCodeJs);
            myEditor = monaco.editor.create(editorContainer, {
                value : demoCodeJs,
                language: 'javascript',
                theme : 'vs-dark',
                glyphMargin: true
            });
            // myEditor.addCommand(monaco.KeyCode.F4, () => {
            //     runCode();
            // }, '');
        }

        return myEditor;
    }

    public setEditor(editor) {
        this.editor = editor;
    }

    public getEditor() : monaco.editor.IStandaloneCodeEditor {
        return this.editor;
    }

    public getActiveTab() : string {
        return this.activeTab;
    }

    public setJsCode(code : string) {
        this.jsContent.editorValue = code;
    }

    public getJsContent() : string {
        return this.jsContent.editorValue;
    }

    public setHtmlCode(code : string) {
        this.htmlContent.editorValue = code;
    }

    public getHtmlContent() : string {
        return this.htmlContent.editorValue;
    }

    public showHtml() : void {
        if (this.activeTab === 'Html') {
            return;
        }

        this.activeTab = 'Html';
        this.jsContent.editorScrollHeight = this.editor.getScrollTop();
        this.jsContent.editorValue = this.editor.getValue();
        this.editor.setValue(this.htmlContent.editorValue);
        this.editor.setScrollTop(this.htmlContent.editorScrollHeight);
        monaco.editor.setModelLanguage(this.editor.getModel(), 'html');
    }

    public showJs() : void {
        if (this.activeTab === 'Js') {
            return;
        }

        this.activeTab = 'Js';
        this.htmlContent.editorScrollHeight = this.editor.getScrollTop();
        this.htmlContent.editorValue = this.editor.getValue();
        this.editor.setValue(this.jsContent.editorValue);
        this.editor.setScrollTop(this.jsContent.editorScrollHeight);
        monaco.editor.setModelLanguage(this.editor.getModel(), 'javascript');
    }


}

export default EditorController;