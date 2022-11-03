import { Map as ImmutableMap } from 'immutable';
import emojify from 'flavours/glitch/features/emoji/emoji';

export const translate = async (status, locale) => {
  const content = status.get('content');
  const text = content.replace(/<\/?(p|br)\s*?\/?>/g, '\n').replace(/<[^>]+?>/g, '');
  const spoiler = status.get('spoiler_text');
  const devider = '\n\n';

  const urlParameter = encodeURIComponent(`${spoiler}${devider}${text}`);
  const url = `https://translate.qdon.space/${locale}/${urlParameter}`;

  let translatedStatus = new Map();

  try {
    const response = await fetch(url, { credentials: 'omit' });
    const json = await response.json();
    const translated = json.text;

    let translatedSpoiler, translatedContent;

    if (spoiler) {
      // split
      [translatedSpoiler, translatedContent] = translated.split(devider);
    } else {
      translatedContent = translated;
      translatedSpoiler = null;
    }

    // Make html
    const elem = document.createElement('div');
    elem.innerText = translatedContent;

    translatedStatus = new ImmutableMap({
      'contentHtml': emojify(elem.outerHTML),
      'spoiler_text': translatedSpoiler !== null ? emojify(translatedSpoiler) : null,
    });
  } catch (_e) {
    translatedStatus = new ImmutableMap({
      'spoiler_text': emojify(`Translation failed: ${spoiler}`),
    });
  }

  return translatedStatus;
};
