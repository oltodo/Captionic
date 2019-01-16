import { padStart } from 'lodash';

export const prettify = (duration, max = 0) => {
  const hours = Math.floor(duration / 3600);
  const minutes = padStart(Math.floor(duration / 60), 2, '0');
  const seconds = padStart(Math.floor(duration % 60), 2, '0');

  if (hours || max >= 3600) {
    return `${hours}:${minutes}:${seconds}`;
  }

  return `${minutes}:${seconds}`;
};

export default null;
