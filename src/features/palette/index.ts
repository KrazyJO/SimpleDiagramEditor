//---------------------IMPORTS---------------------
import PaletteProvider from './PaletteProvider';

//---------------------EXPORT---------------------
export default {
  __depends__: [
    require('@diagram-ts/features/palette').default,
    require('@diagram-ts/features/create'),
    require('@diagram-ts/features/hand-tool').default,
    require('@diagram-ts/features/lasso-tool').default,
    require('../../diagram-ts/features/space-tool').default
  ],
  __init__: ['paletteProvider'],
  paletteProvider: ['type', PaletteProvider]
};
