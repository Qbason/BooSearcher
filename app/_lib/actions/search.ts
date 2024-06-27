'use server';

import { Prisma, Search } from '@prisma/client';

import { getAuthenticatedUser } from '@lib/DAL/general';
import { DataErrorType } from '@lib/interfaces/data-error';
import { errorWrapperAsync } from '@lib/tools/general';
import { getSearchByUserId } from '@repo/search';

export const getSearch = async (
  searchId: Search['id'],
): Promise<
  DataErrorType<Prisma.PromiseReturnType<typeof getSearchByUserId> | null>
> => {
  const [user, error] = await getAuthenticatedUser();
  if (error !== undefined) return [undefined, error];

  return errorWrapperAsync(() => getSearchByUserId(user.id, searchId));
};
