//---------------------IMPORTS---------------------
import * as LabelUtil from './LabelUtil';

//---------------------CLASS--------------------
export default class UpdateLabelHandler {

  //---------------------METHODS---------------------
  execute(ctx) {
    ctx.oldLabel = LabelUtil.getLabel(ctx.element);
    return this.setText(ctx.element, ctx.newLabel);
  }

  revert(ctx) {
    return this.setText(ctx.element, ctx.oldLabel);
  }

  setText(element, text) {
    const label = element.label || element;
    const labelTarget = element.labelTarget || element;
    LabelUtil.setLabel(label, text);
    return [label, labelTarget];
  }
}
