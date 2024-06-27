'use server';

import {
  DateState,
  Prisma,
  Search,
  SearchRequest,
  State,
} from '@prisma/client';

import { prisma } from '@lib/DAL/prisma';
import { SearchRequestWithSearches } from '@lib/interfaces/request';
import { isOlderOrEqualToToday } from '@lib/tools/date';

export const addSearchToSearchRequest = async (
  requestId: string,
  data: {
    dateEnd: Search['dateEnd'];
    dateStart: Search['dateStart'];
    duration: Search['duration'];
    offersCount: Search['offersCount'];
    status: Search['status'];
    offersFound: Prisma.PlaceCreateWithoutPlacesStateInput[];
  },
) => {
  //create or updated all places!
  const allPlacesAddedOrUpdated = await prisma.$transaction(
    data.offersFound.map((place) =>
      prisma.place.upsert({
        select: {
          id: true,
          urlId: true,
        },
        where: {
          urlId: place.urlId,
        },
        update: {
          address: place.address,
          features: place.features,
          image: place.image,
          numberOfOpinions: place.numberOfOpinions,
          price: place.price,
          reviewScore: place.reviewScore,
          stars: place.stars,
          title: place.title,
        },
        create: {
          address: place.address,
          features: place.features,
          image: place.image,
          numberOfOpinions: place.numberOfOpinions,
          price: place.price,
          reviewScore: place.reviewScore,
          stars: place.stars,
          title: place.title,
          urlId: place.urlId,
          url: place.url,
          placesState: {
            create: [],
          },
        },
      }),
    ),
  );
  const allPlacesAddedOrUpdatedSet = new Set(
    allPlacesAddedOrUpdated.map((place) => place.urlId),
  );

  // add only the new places to the search
  const allRequestIdOffers = (
    await prisma.searchRequest.findMany({
      select: {
        searches: {
          select: {
            offers: {
              select: {
                place: {
                  select: {
                    urlId: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        id: requestId,
      },
    })
  ).flatMap((search) =>
    search.searches.flatMap((search) =>
      search.offers.map((offer) => offer.place),
    ),
  );

  const allFoundOffersInDBSet = new Set(
    allRequestIdOffers.map((place) => place.urlId),
  );
  const newOffers = allPlacesAddedOrUpdated.filter(
    (place) => !allFoundOffersInDBSet.has(place.urlId),
  );
  const missingOffers = allRequestIdOffers.filter(
    (place) => !allPlacesAddedOrUpdatedSet.has(place.urlId),
  );

  await prisma.placeState.updateMany({
    where: {
      place: {
        urlId: {
          in: missingOffers.map((place) => place.urlId),
        },
      },
      search: {
        searchRequestId: requestId,
      },
    },
    data: {
      isAvailable: false,
    },
  });

  //add to request the new search with the new places
  await prisma.searchRequest.update({
    where: {
      id: requestId,
    },
    data: {
      searchesCount: {
        increment: 1,
      },
      searches: {
        create: {
          dateStart: data.dateStart,
          dateEnd: data.dateEnd,
          duration: data.duration,
          offersCount: newOffers.length,
          status: data.status,
          offers:
            newOffers.length === 0
              ? {}
              : {
                  createMany: {
                    data: newOffers.map((place) => {
                      return {
                        placeId: place.id,
                        state: State.New,
                      };
                    }),
                  },
                },
        },
      },
      lastSearch: data.dateEnd,
      isRunning: false,
    },
  });
  return await prisma.place.findMany({
    where: {
      urlId: {
        in: newOffers.map((place) => place.urlId),
      },
    },
  });
};

export const createNewRequest = async (data: {
  name: SearchRequest['name'];
  url: SearchRequest['url'];
  userId: SearchRequest['userId'];
  dateStart: SearchRequest['dateStart'];
  dateEnd: SearchRequest['dateEnd'];
}) => {
  const result = await prisma.searchRequest.create({
    data: {
      name: data.name,
      url: data.url,
      created: new Date(),
      dateStart: data.dateStart,
      dateEnd: data.dateEnd,
      state: isOlderOrEqualToToday(data.dateStart)
        ? DateState.Ready
        : DateState.Waiting,
      user: {
        connect: {
          id: data.userId,
        },
      },
    },
  });
  return result;
};

export const getAllRequestsByUserId = async (
  userId: string,
): Promise<
  {
    id: SearchRequest['id'];
    created: SearchRequest['created'];
    name: SearchRequest['name'];
    url: SearchRequest['url'];
    searchesCount: SearchRequest['searchesCount'];
  }[]
> => {
  const result = await prisma.searchRequest.findMany({
    where: {
      userId,
    },
    select: {
      created: true,
      id: true,
      name: true,
      url: true,
      searchesCount: true,
    },
  });

  return result;
};

export const isUrlAlreadyExists = async (
  url: string,
  userId: string,
): Promise<boolean> => {
  const result = await prisma.searchRequest.findFirst({
    where: {
      url,
      userId,
    },
  });
  return result !== null;
};

export const getRequestByIdAndUserId = async (
  requestId: string,
  userId: string,
): Promise<SearchRequestWithSearches | null> => {
  return await prisma.searchRequest.findFirst({
    where: {
      id: requestId,
      userId,
    },
    include: {
      searches: true,
    },
  });
};

export const updateStateRequests = async () => {
  const today = new Date();

  await prisma.searchRequest.updateMany({
    where: {
      dateEnd: {
        lt: today,
      },
    },
    data: {
      state: DateState.Expired,
    },
  });

  await prisma.searchRequest.updateMany({
    where: {
      dateStart: {
        lte: today,
      },
      dateEnd: {
        gte: today,
      },
    },
    data: {
      state: DateState.Ready,
    },
  });
};

export const getSearchRequestForSearcher = async () => {
  const before1Hour = new Date();
  before1Hour.setHours(before1Hour.getHours() - 1);

  return await prisma.$transaction(async (tx) => {
    const searchRequest = await tx.searchRequest.findFirst({
      where: {
        state: DateState.Ready,
        isRunning: false,
        OR: [
          { lastSearch: { isSet: false } },
          {
            lastSearch: {
              lte: before1Hour,
            },
          },
        ],
      },
      select: {
        id: true,
        url: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    if (searchRequest !== null) {
      await tx.searchRequest.update({
        where: {
          id: searchRequest.id,
        },
        data: {
          isRunning: true,
        },
      });
    }
    return searchRequest;
  });
};
