import * as TestContainer from 'mocha-test-container-support';
import Debugger from '@src/Debugger';

import { expect } from "chai";
// import { Test } from 'mocha';
// const sinon = require('sinon');
var chai = require('chai');
chai.use(require('sinon-chai')); 

describe('using debugger disabled state', function() {
    
    var t;

    beforeEach(function() {
        t = TestContainer.get(this);
    });

    
    it('should set debugger buttons', function() {

        var btnRun = document.createElement('button');
        btnRun.setAttribute('id', 'btnRun');
        var btnDebug = document.createElement('button');
        btnDebug.setAttribute('id', 'btnDebug');
        var btnStep = document.createElement('button');
        btnStep.setAttribute('id', 'btnStep');
        var btnRunAll = document.createElement('button');
        btnRunAll.setAttribute('id', 'btnRunAll');
        var btnDownloadModel = document.createElement('button');
        btnDownloadModel.setAttribute('id', 'btnDownloadModel');

        t.appendChild(btnRun);
        t.appendChild(btnDebug);
        t.appendChild(btnStep);
        t.appendChild(btnRunAll);
        t.appendChild(btnDownloadModel);

        var oDebugger = new Debugger();
        //buttons are enabled yet
        oDebugger.disableDebuggerButtons();
        expect(btnRun.hasAttribute('disabled')).to.be.false;
        expect(btnDebug.hasAttribute('disabled')).to.be.false;
        expect(btnStep.hasAttribute('disabled')).to.be.true;
        expect(btnRunAll.hasAttribute('disabled')).to.be.true;
        expect(btnDownloadModel.hasAttribute('disabled')).to.be.true;
        
        
        oDebugger.enableDebuggerButtons();
        expect(btnRun.hasAttribute('disabled')).to.be.true;
        expect(btnDebug.hasAttribute('disabled')).to.be.true;
        expect(btnStep.hasAttribute('disabled')).to.be.false;
        expect(btnRunAll.hasAttribute('disabled')).to.be.false;
        expect(btnDownloadModel.hasAttribute('disabled')).to.be.false;

        t = undefined;
    });

    it('should inject code', function() {
        var iframe = document.createElement('iframe');
        iframe.setAttribute('id', 'preview');
        t.appendChild(iframe);

        var htmlcode = 
        `
        <html>
            <head>
            </head>
            <body>
            <body>
        </html>
        `;


        var jscode = 
        `
        document.onload = function() {
            console.log("inserted");
        }
        `;

        var combinedCode = 
        `
        <html>
            <head><script>
        document.onload = function() {
            console.log("inserted");
        }
        </script>
            </head>
            <body>
            <body>
        </html>
        `;

        var oDebugger = new Debugger();
        oDebugger.run(jscode, htmlcode);
        var insertedCode = iframe.getAttribute("srcdoc");
        expect(insertedCode).to.equal(combinedCode);

        htmlcode =
        `
        <html>
            <body>
            <body>
        </html>
        `;

        combinedCode = 
        `
        <html><head><script>
        document.onload = function() {
            console.log("inserted");
        }
        </script></head>
            <body>
            <body>
        </html>
        `;

        oDebugger.run(jscode, htmlcode);
        insertedCode = iframe.getAttribute("srcdoc");
        expect(insertedCode).to.equal(combinedCode);

        htmlcode =
        ``;

        combinedCode = 
        `<script>
        document.onload = function() {
            console.log("inserted");
        }
        </script>`;

        oDebugger.run(jscode, htmlcode);
        insertedCode = iframe.getAttribute("srcdoc");
        expect(insertedCode).to.equal(combinedCode);

        t = undefined;
    });

    it('should insert promises on run debug to code', function() {
        var iframe = document.createElement('iframe');
        iframe.setAttribute('id', 'preview');
        t.appendChild(iframe);
        
        
        var btnRun = document.createElement('button');
        btnRun.setAttribute('id', 'btnRun');
        var btnDebug = document.createElement('button');
        btnDebug.setAttribute('id', 'btnDebug');
        var btnStep = document.createElement('button');
        btnStep.setAttribute('id', 'btnStep');
        var btnRunAll = document.createElement('button');
        btnRunAll.setAttribute('id', 'btnRunAll');
        var btnDownloadModel = document.createElement('button');
        btnDownloadModel.setAttribute('id', 'btnDownloadModel');

        t.appendChild(btnRun);
        t.appendChild(btnDebug);
        t.appendChild(btnStep);
        t.appendChild(btnRunAll);
        t.appendChild(btnDownloadModel);

        let htmlcode = 
`<html>
    <body>
    <body>
</html>`;
        let jscode =
`
//@debug
function foo(bar, baz) {
    console.log("debug this code");
}
`;

        var oEditorControllerStub : any = {
            setDecorations : function() {}
        }

        var oDebugger = new Debugger();
        oDebugger.setEditorController(oEditorControllerStub);
        var insertedCode = oDebugger.debug(jscode, htmlcode);
        // var insertedCode = iframe.getAttribute("srcdoc");

        var codetoproof =
`<html><head><script>undefined
var promiseResolve1;
var promiseReject1;
var promise1;

function activatePromises() {

    promise1 = new Promise(function(resolve, reject){
        promiseResolve1 = resolve;
        promiseReject1 = reject;
    });

}

async function foo(bar, baz) {

var promise = new Promise(function(resolve, reject) {
window['firstResponsePromiseResolve'] = resolve;
});
parent.postMessage('debugger:activate', parent.location.origin);
await promise;

await promise1;
console.log("debug this code")
}
</script></head>
<body>
<body>
</html>`;

        var trimedLines = insertedCode.split('\n').map((line) => {
            return line.trim();
        })

        var trimedCodeToProof = codetoproof.split('\n').map((line) => {
            return line.trim();
        })
        expect(trimedLines.join()).to.equal(trimedCodeToProof.join());


       
    });
});
