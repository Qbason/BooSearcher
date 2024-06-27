'use server';

import { Prisma, Search, User } from '@prisma/client';

import { prisma } from '@lib/DAL/prisma';

export const getAllSearchesByUserId = async (userId: User['id']) => {
  return await prisma.searchRequest.findMany({
    where: {
      userId,
    },
    select: {
      searches: true,
    },
  });
};

export const getSearchByUserId = async (
  userId: User['id'],
  searchId: Search['id'],
): Promise<Prisma.SearchGetPayload<{
  include: {
    offers: {
      select: {
        id: true;
        isAvailable: true;
        place: true;
        state: true;
      };
    };
  };
}> | null> => {
  return await prisma.search.findUnique({
    where: {
      id: searchId,
      searchRequest: {
        userId,
      },
    },
    include: {
      offers: {
        select: {
          id: true,
          isAvailable: true,
          state: true,
          place: true,
        },
      },
    },
  });
};
