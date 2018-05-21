//---------------------IMPORTS---------------------
import EasyTreeWalker from './EasyTreeWalker';

//---------------------CLASS--------------------
class Visitor {
  importer: any;
  warnings: Warning[] = [];

  //---------------------CONSTRUCTOR---------------------
  constructor(importer: any) {
    this.importer = importer;
  }

  //---------------------METHODS---------------------
  root(element) {
    return this.importer.root(element);
  }

  element(element, parentShape) {
    return this.importer.add(element, parentShape);
  }

  error(message, context) {
    this.warnings.push({
        message: message,
        context: context
    });
  }
}

export interface Warning {
  message: string;
  context: any;
}

//---------------------STATIC--------------------
export function importEasyDiagram(diagram, definitions, done) {
  const importer = diagram.get('easyImporter');
  const eventBus = diagram.get('eventBus');
  let error;
  let warnings: Warning[] = [];
  function render(definitions) {
    const visitor = new Visitor(importer);
    const walker = new EasyTreeWalker(visitor);
    walker.handleDefinitions(definitions);
    warnings = visitor.warnings;
  }
  eventBus.fire('import.render.start', {
    definitions: definitions
  });
  try {
    render(definitions);
  } catch (e) {
    error = e;
  }
  eventBus.fire('import.render.complete', {
    error: error,
    warnings: warnings
  });
  done(error, warnings);
}
