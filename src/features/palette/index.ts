//---------------------IMPORTS---------------------
import PaletteProvider from './PaletteProvider';

//---------------------EXPORT---------------------
export default {
  __depends__: [
    // require('diagram-js/lib/features/palette'),
    require('@diagram-ts/features/palette').default,
    // require('diagram-js/lib/features/create'),
    require('@diagram-ts/features/create'),
    // require('diagram-js/lib/features/hand-tool'),
    require('@diagram-ts/features/hand-tool').default,
    // require('diagram-js/lib/features/lasso-tool'),
    require('@diagram-ts/features/lasso-tool').default,
    // require('diagram-js/lib/features/space-tool')
    require('../../diagram-ts/features/space-tool').default
  ],
  __init__: ['paletteProvider'],
  paletteProvider: ['type', PaletteProvider]
};
