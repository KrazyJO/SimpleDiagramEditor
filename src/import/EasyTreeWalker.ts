//---------------------IMPORTS---------------------
// import * as Refs from 'object-refs';
const Refs = require('object-refs');

//---------------------CONSTANTS---------------------
// let diRefs = new Refs({ name: 'easyElement', enumerable: true }, { name: 'di' });
let diRefs = new Refs({ name: 'simpleDebugEditorElement', enumerable: true }, { name: 'di' });

//---------------------CLASS--------------------
export default class EasyTreeWalker {
  private baseElements: any[] = [];

  //---------------------CONSTRUCTOR---------------------
  constructor(private handler: any) { }

  //---------------------METHODS---------------------
  ///// Helpers /////////////////////////////////
  visit(element, context) {
    return this.handler.element(element, context);
  }

  visitRoot(element) {
    return this.handler.root(element);
  }

  visitIfDi(element, context) {
    try {
        return element.di && this.visit(element, context);
    } catch (e) {
      this.logError(e.message, { element: element, error: e });
      console.error(`failed to import ${this.elementToString(element)}`);
      console.error(e);
    }
  }

  logError(message, context?: any) {
    console.log(message, context);
    this.handler.error(message, context);
  }

  contextual(fn, ctx?) {
    return function(e) {
      fn(e, ctx);
    };
  }

  elementToString (element) {
    if (!element) {
      return '<null>';
    }
    return `<${element.$type} ${element.id ? ' id="' + element.id : ''} />`;
  }

  ////// DI handling ////////////////////////////
  registerDi(di) {
    // const easyElement = di.easyElement;
    const easyElement = di.simpleDebugEditorElement;
    if (easyElement) {
      if (easyElement.di) {
        this.logError(`multiple DI elements defined for ${this.elementToString(easyElement)}`, { element: easyElement });
      } else {
        this.baseElements.push(easyElement);
        diRefs.bind(easyElement, 'di');
        easyElement.di = di;
      }
    } else {
      this.logError(`no twElement referenced in ${this.elementToString(di)}`, { element: di });
    }
  }

  handleDiagram(diagram) {
    this.handleDiagramElements(diagram.diagramElements);
  }

  handleDiagramElements(diagramElements) {
    if (diagramElements) {
      for (let element of diagramElements) {
        this.handleDiagramElement(element);
      }
    }
  }

  handleDiagramElement(diagramElement) {
    this.registerDi(diagramElement);
  }

  ////// Semantic handling //////////////////////
  handleDefinitions(definitions, diagram?: any) {
    if (!diagram) {
      diagram = definitions.diagram;
    }
    this.handleDiagram(diagram);
    const context = this.visitRoot(diagram);
    for (let element of this.baseElements) {
      this.contextual(this.handleBaseElement(element, context), context);
    }
  }

  handleBaseElement(element, context?) {
    if (element.$instanceOf('ea:Node')) {
      this.handleResource(element, context);
    } else if (element.$instanceOf('ea:Edge')) {
      this.handleConnection(element, context);
    }
  }

  handleConnection(connection, ctx) {
    if (connection.$instanceOf('ea:Edge')) {
      this.visitIfDi(connection, ctx);
    } else {
      this.logError('type safety would be nice');
    }
  }

  handleResource(resource, ctx) {
    this.visitIfDi(resource, ctx);
  }
}
