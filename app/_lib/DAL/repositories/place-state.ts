'use server';
import { PlaceState, State, User } from '@prisma/client';

import { prisma } from '@lib/DAL/prisma';

const chgPlaceState = async (
  placeStateId: PlaceState['id'],
  state: State,
  userId: User['id'],
) => {
  return await prisma.placeState.update({
    where: {
      id: placeStateId,
      search: {
        searchRequest: {
          userId,
        },
      },
    },
    data: {
      state,
    },
  });
};

const getAllPlacesByRequestId = async (requestId: string, userId: string) => {
  return await prisma.placeState.findMany({
    where: {
      search: {
        searchRequestId: requestId,
        searchRequest: {
          userId,
        },
      },
    },
    include: {
      place: true,
    },
  });
};

export { chgPlaceState, getAllPlacesByRequestId };
