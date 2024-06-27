'use client';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Image,
} from '@nextui-org/react';
import { Prisma, State } from '@prisma/client';
import { useEffect, useState } from 'react';
import { BiHide } from 'react-icons/bi';
import { MdFavorite } from 'react-icons/md';
import { RxOpenInNewWindow } from 'react-icons/rx';

import { changePlaceState } from '@lib/actions/place-state';
import { getSearch } from '@lib/actions/search';
import { getSearchByUserId } from '@repo/search';

const MySearchDetails = ({ params }: { params: { id: string } }) => {
  const [search, setSearch] = useState<Prisma.PromiseReturnType<
    typeof getSearchByUserId
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearch = async () => {
      const [data, error] = await getSearch(params.id);
      if (data === undefined) {
        setError(error);
      } else if (data === null) {
        setError("Couldn't fetch search data.");
      } else {
        data.offers = data.offers.toSorted((a, b) => {
          if (a.state === State.Favorite && b.state !== State.Favorite)
            return -1;
          if (a.state !== State.Favorite && b.state === State.Favorite)
            return 1;
          if (a.state === State.New && b.state !== State.New) return -1;
          if (a.state !== State.New && b.state === State.New) return 1;
          return a.place.price - b.place.price;
        });
        setSearch(data);
      }
    };
    fetchSearch().catch(() => setError("Couldn't fetch search data."));
  }, [params.id]);

  const cards = search?.offers
    .filter((el) => {
      return el.state !== State.Hidden;
    })
    .map((offer) => {
      let borderColor = '';
      if (offer.state === State.New) {
        borderColor = 'border border-blue-500';
      } else if (offer.state === State.Favorite) {
        borderColor = 'border border-yellow-500';
      }

      return (
        <Card
          key={offer.place.id}
          className={`w-[300px] min-h-[500px] ${borderColor} flex justify-center items-center`}
          onClick={async () => {
            if (offer.state === State.New) {
              const [_, error] = await changePlaceState(offer.id, State.Seen);
              if (error) {
                setError(error);
                return;
              }
              setSearch((prevSearch) => {
                if (prevSearch === null) return null;
                return {
                  ...prevSearch,
                  offers: prevSearch.offers.map((o) => {
                    if (o.place.id === offer.place.id) {
                      return {
                        ...o,
                        state: State.Seen,
                      };
                    }
                    return o;
                  }),
                };
              });
            }
          }}
        >
          <CardHeader className="pb-0 pt-2 px-4 flex flex-col items-center">
            <h4 className="font-bold text-large" title={offer.place.title}>
              {offer.place.title && offer.place.title.length > 25
                ? `${offer.place.title.slice(0, 25)}...`
                : offer.place.title}
            </h4>
          </CardHeader>
          <CardBody className="overflow-visible py-2 flex flex-col items-center">
            <p className="text-tiny uppercase font-bold">
              {offer.place.address}
            </p>
            <small className="text-default-500">{offer.place.price} zł</small>
            <small className="text-default-500">
              Number of opinions: {offer.place.numberOfOpinions}
            </small>
            <small className="text-default-500">
              Rating: {offer.place.reviewScore}
            </small>
            {offer.place.stars ? (
              <small className="text-default-500">
                Stars: {offer.place.stars}
              </small>
            ) : null}
            {offer.place.features.length > 0 ? (
              <div className="flex flex-col justify-start items-start">
                <div>Features:</div>
                {offer.place.features.map((feature) => (
                  <ul
                    key={feature.name}
                    className="ps-2 text-default-500 text-xs"
                  >
                    <li>{feature.name}</li>
                  </ul>
                ))}
              </div>
            ) : null}
            <div className="flex grow items-end">
              <Image
                alt="Object"
                className="object-cover rounded-xl"
                src={offer.place.image}
                width={225}
              />
            </div>
          </CardBody>
          <CardFooter className="py-2 gap-2 flex flex-row justify-center w-[225px]">
            <div className="border border-gray-500 rounded-md p-2 cursor-pointer">
              <MdFavorite
                color={offer.state === State.Favorite ? '#F31260' : 'white'}
                className={
                  offer.state !== State.Favorite
                    ? 'hover:bg-[#F31260] rounded-full p-1'
                    : ''
                }
                size="20"
                onClick={async () => {
                  const [_, error] = await changePlaceState(
                    offer.id,
                    offer.state === State.Favorite
                      ? State.Seen
                      : State.Favorite,
                  );
                  if (error) {
                    setError(error);
                    return;
                  }
                  setSearch((prevSearch) => {
                    if (prevSearch === null) return null;
                    return {
                      ...prevSearch,
                      offers: prevSearch.offers.map((o) => {
                        if (o.place.id === offer.place.id) {
                          const newState =
                            o.state === State.Favorite
                              ? State.Seen
                              : State.Favorite;
                          return {
                            ...o,
                            state: newState,
                          };
                        }
                        return o;
                      }),
                    };
                  });
                }}
              />
            </div>
            <div className="border border-gray-500 rounded-md p-2 cursor-pointer hover:bg-gray-300 hover:text-black">
              <BiHide
                size="20"
                className="p-[1px]"
                onClick={async () => {
                  const [_, error] = await changePlaceState(
                    offer.id,
                    offer.state === State.Hidden ? State.Seen : State.Hidden,
                  );
                  if (error) {
                    setError(error);
                    return;
                  }
                  setSearch((prevSearch) => {
                    if (prevSearch === null) return null;
                    return {
                      ...prevSearch,
                      offers: prevSearch.offers.map((o) => {
                        if (o.place.id === offer.place.id) {
                          return {
                            ...o,
                            state:
                              o.state === State.Hidden
                                ? State.Seen
                                : State.Hidden,
                          };
                        }
                        return o;
                      }),
                    };
                  });
                }}
              />
            </div>
            <div className="border border-gray-500 rounded-md p-2 cursor-pointer hover:bg-gray-300 hover:text-black">
              <RxOpenInNewWindow
                size="20"
                onClick={() => {
                  offer.place.url && window.open(offer.place.url, '_blank');
                }}
              />
            </div>
          </CardFooter>
        </Card>
      );
    });

  return (
    <main>
      <section className="flex flex-row flex-wrap gap-4 justify-center items-center p-4">
        {error ? (
          <div className="text-red-500 text-sm font-bold">{error}</div>
        ) : null}
        {cards}
      </section>
    </main>
  );
};

export default MySearchDetails;
