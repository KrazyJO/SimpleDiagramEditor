import translate from '@diagram-ts/i18n/translate/translate';

export default function customTranslate(template, replacements) {
  if (template === 'Remove') {
    template = 'Eliminar';
  }

  if (template === 'Activate the hand tool') {
    template = 'Activar herramienta mano';
  }

  return translate(template, replacements);
}