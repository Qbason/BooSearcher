import { DataErrorType } from '@lib/interfaces/data-error';
import { Logger } from '@lib/tools/logger';

export const errorWrapperAsync = async <T>(
  fn: () => Promise<T>,
): Promise<DataErrorType<T>> => {
  try {
    return [await fn(), undefined];
  } catch (e: unknown) {
    Logger.getInstance().error(e);
    let error = 'Unknown error';
    if (typeof e === 'string') {
      error = e;
    } else if (e instanceof Error) {
      error = e.message;
    }

    return [undefined, error];
  }
};

export const errorWrapper = <T>(fn: () => T): DataErrorType<T> => {
  try {
    return [fn(), undefined];
  } catch (e) {
    Logger.getInstance().error(e);
    let error = 'Unknown error';
    if (typeof e === 'string') {
      error = e;
    } else if (e instanceof Error) {
      error = e.message;
    }

    return [undefined, error];
  }
};
