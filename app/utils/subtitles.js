import fs from 'fs-jetpack';
import subsrt from '@oltodo/subsrt';
import { WebVTT } from 'vtt.js';

export const supportedExtensions = ['vtt', 'srt'];

export const resolveSubtitles = path =>
  supportedExtensions.reduce((acc, ext) => {
    const subPath = path.replace(/\.\w+?$/, `.${ext}`);

    return fs.exists(subPath) ? subPath : acc;
  }, null);

export const loadSubtitles = path => {
  if (!fs.exists(path)) {
    return null;
  }

  const cues = [];
  const content = fs.read(path);
  const convertedContent = subsrt.convert(content, { format: 'vtt' });
  const parser = new WebVTT.Parser(window, WebVTT.StringDecoder());

  parser.oncue = cue => {
    cues.push(cue);
  };

  parser.onparsingerror = parsingError => {
    console.error(parsingError);
  };

  parser.parse(convertedContent);
  parser.flush();

  return cues;
};
