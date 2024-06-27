import { Prisma } from '@prisma/client';

export type SearchRequestWithSearches = Prisma.SearchRequestGetPayload<{
  include: {
    searches: true;
  };
}>;
