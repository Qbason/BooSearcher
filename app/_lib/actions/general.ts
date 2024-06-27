'use server';

import { getAuthenticatedUser } from '@lib/DAL/general';
import { Watcher } from '@lib/core/watcher';
import { DataErrorType } from '@lib/interfaces/data-error';
import { getCleanUrl } from '@lib/tools/core/url-converter';
import { errorWrapper, errorWrapperAsync } from '@lib/tools/general';
import { isEmpty, validateStartEndDate } from '@lib/tools/validators';
import { createNewRequest, isUrlAlreadyExists } from '@repo/search-request';

export const addNewSearch = async (
  name: string,
  url: string,
  dateStart: Date,
  dateEnd: Date,
): Promise<DataErrorType<string>> => {
  const [startEndDate, errorStartEndDate] = validateStartEndDate(
    dateStart,
    dateEnd,
    30,
  );
  if (errorStartEndDate !== undefined) {
    return [undefined, errorStartEndDate];
  }

  if (isEmpty(name) || isEmpty(url)) {
    return [undefined, 'Please fill all the fields'];
  }

  const [cleanUrl, urlError] = errorWrapper(() => getCleanUrl(url));
  if (urlError !== undefined) return [undefined, urlError];

  const [user, userError] = await getAuthenticatedUser();
  if (userError !== undefined) return [undefined, userError];

  const [isUrlAlreadyExistsInDb, isUrlAlreadyExistsInDbError] =
    await errorWrapperAsync(() => isUrlAlreadyExists(cleanUrl, user.id));

  if (isUrlAlreadyExistsInDbError)
    return [undefined, isUrlAlreadyExistsInDbError];
  if (isUrlAlreadyExistsInDb) return [undefined, 'Url already exists'];

  const [newRequest, requestError] = await errorWrapperAsync(() => {
    return createNewRequest({
      name,
      url: cleanUrl,
      userId: user.id,
      ...startEndDate,
    });
  });
  if (requestError !== undefined) {
    return [undefined, 'Error while creating request'];
  }

  errorWrapper(() => {
    void Watcher.getInstance().trigger();
  });

  return [newRequest.id, undefined];
};
