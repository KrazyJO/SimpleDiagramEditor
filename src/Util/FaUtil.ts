//---------------------IMPORTS---------------------
import * as fontawesome from '@fortawesome/fontawesome';
import { faHandPaper } from '@fortawesome/fontawesome-free-regular';
import {
  faCut,
  faExpandArrowsAlt,
  faLongArrowAltRight,
  faTrashAlt,
  faRedoAlt,
  faPlus,
} from '@fortawesome/fontawesome-free-solid';

//---------------------METHODS---------------------
fontawesome.library.add(faLongArrowAltRight, faTrashAlt, faHandPaper, faCut, faExpandArrowsAlt, faRedoAlt);

fontawesome.config.autoReplaceSvg = 'nest' as any;

function getFaCssClass(icon: fontawesome.IconDefinition) {
  return icon.prefix + ' fa-' + icon.iconName;
}

export const handTool = () => getFaCssClass(faHandPaper);

export const lassoTool = () => getFaCssClass(faCut);

export const spaceTool = () => getFaCssClass(faExpandArrowsAlt);

export const connectIcon = () => getFaCssClass(faLongArrowAltRight);

export const trashIcon = () => getFaCssClass(faTrashAlt);

export const rotateIcon = () => getFaCssClass(faRedoAlt);

export const createIcon = () => getFaCssClass(faPlus);
