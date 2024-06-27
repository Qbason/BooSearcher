import { neededParams, noNeededParams } from '@lib/tools/core/params-data';
import { errorWrapper } from '@lib/tools/general';

const hasProperParams = (urlObject: URL) => {
  const paramsNoFound: string[] = [];

  for (const param of neededParams) {
    if (!urlObject.searchParams.has(param)) {
      paramsNoFound.push(param);
    }
  }

  if (paramsNoFound.length > 0) {
    throw new Error(
      `Params not found ${paramsNoFound.map((param) => param).join(', ')}`,
    );
  }
};

const getCleanUrl = (url: string): string => {
  const urlObject = new URL(url);

  if (urlObject.searchParams.size === 0) {
    throw new Error('Incorrect url');
  }

  if (urlObject.origin.startsWith('https://www.booking.com/')) {
    throw new Error('Incorrect website');
  }

  const [_, paramsError] = errorWrapper(() => hasProperParams(urlObject));
  if (paramsError !== undefined) {
    throw new Error(paramsError);
  }

  for (const value of noNeededParams) {
    urlObject.searchParams.delete(value);
  }

  return urlObject.href;
};
export { getCleanUrl };
