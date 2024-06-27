'use server';

import { Search, SearchRequest } from '@prisma/client';

import { getAuthenticatedUser } from '@lib/DAL/general';
import { DataErrorType } from '@lib/interfaces/data-error';
import { SearchRequestWithSearches } from '@lib/interfaces/request';
import { errorWrapperAsync } from '@lib/tools/general';
import { getAllSearchesByUserId } from '@repo/search';
import {
  getAllRequestsByUserId,
  getRequestByIdAndUserId,
} from '@repo/search-request';

export const getAllRequests = async (): Promise<
  DataErrorType<
    {
      id: SearchRequest['id'];
      created: SearchRequest['created'];
      name: SearchRequest['name'];
      url: SearchRequest['url'];
      searchesCount: SearchRequest['searchesCount'];
    }[]
  >
> => {
  const [user, error] = await getAuthenticatedUser();
  if (error !== undefined) return [undefined, error];
  return await errorWrapperAsync(() => getAllRequestsByUserId(user.id));
};
export const getRequest = async (
  id: string,
): Promise<DataErrorType<SearchRequestWithSearches | null>> => {
  const [user, error] = await getAuthenticatedUser();
  if (error !== undefined) return [undefined, error];

  return await errorWrapperAsync(() => getRequestByIdAndUserId(id, user.id));
};

export const getAllSearches = async (): Promise<DataErrorType<Search[]>> => {
  const [user, error] = await getAuthenticatedUser();
  if (error !== undefined) return [undefined, error];

  const [requests, requestsError] = await errorWrapperAsync(() =>
    getAllSearchesByUserId(user.id),
  );
  if (requestsError !== undefined) return [undefined, requestsError];

  const searches: Search[] = [];
  for (const request of requests) {
    searches.push(...request.searches);
  }
  return [searches, undefined];
};
