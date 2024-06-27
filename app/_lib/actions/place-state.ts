'use server';

import { PlaceState, Prisma, State } from '@prisma/client';

import { getAuthenticatedUser } from '@lib/DAL/general';
import { DataErrorType } from '@lib/interfaces/data-error';
import { errorWrapperAsync } from '@lib/tools/general';
import { chgPlaceState, getAllPlacesByRequestId } from '@repo/place-state';

export const changePlaceState = async (
  placeStateId: PlaceState['id'],
  state: State,
): Promise<DataErrorType<Prisma.PromiseReturnType<typeof chgPlaceState>>> => {
  const [user, error] = await getAuthenticatedUser();
  if (error !== undefined) return [undefined, error];

  return await errorWrapperAsync(() =>
    chgPlaceState(placeStateId, state, user.id),
  );
};

export const getAllPlaceStateByRequestId = async (
  requestId: string,
): Promise<
  DataErrorType<Prisma.PromiseReturnType<typeof getAllPlacesByRequestId>>
> => {
  const [user, error] = await getAuthenticatedUser();
  if (error !== undefined) return [undefined, error];
  return errorWrapperAsync(() => getAllPlacesByRequestId(requestId, user.id));
};
