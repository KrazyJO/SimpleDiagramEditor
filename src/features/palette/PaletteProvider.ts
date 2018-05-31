//---------------------IMPORTS---------------------
import { assign } from 'min-dash';
import { handTool, lassoTool, spaceTool, createIcon } from '@utils/FaUtil';

//---------------------CLASS--------------------
export default class PaletteProvider {

  //---------------------CONSTRUCTOR---------------------
  constructor(
    public palette,
    private create,
    private elementFactory,
    private handTool,
    private lassoTool,
    private spaceTool
  ) {
    palette.registerProvider(this);
  }

  //---------------------METHODS---------------------
  getPaletteEntries(element) {
    const actions = {};
    assign(actions, {
      'hand-tool': {
        group: 'tools',
        className: handTool(),
        title: 'Activate the hand tool',
        action: {
          click: event => {
            this.handTool.activateHand(event);
          }
        }
      },
      'lasso-tool': {
        group: 'tools',
        className: lassoTool(),
        title: 'Activate the lasso tool',
        action: {
          click: event => {
            this.lassoTool.activateSelection(event);
          }
        }
      },
      'space-tool': {
        group: 'tools',
        className: spaceTool(),
        title: 'Activate the create/remove space tool',
        action: {
          click: event => {
            this.spaceTool.activateSelection(event);
          }
        }
      },
      'tool-separator': {
        group: 'tools',
        separator: true
      },
      'add-node': this.createAction('sde:Node', 'node', createIcon(), 'Add Node'),
    });
    return actions;
  }

  createAction(type, group, className, title, options?) {
    const createListener = event => {
      const shape = this.elementFactory.createShape(assign({ type: type }, options));
      this.create.start(event, shape);
    };
    const shortType = type.replace(/^sde\:/, '');
    return {
      group: group,
      className: className,
      title: title || `Create ${shortType}`,
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }
}

(PaletteProvider as any).$inject = ['palette', 'create', 'elementFactory', 'handTool', 'lassoTool', 'spaceTool'];
