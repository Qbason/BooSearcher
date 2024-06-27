'use client';

import { Prisma, SearchRequest, State } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { SingleCardInfo } from '@components/single-card-info';
import { getAllPlaceStateByRequestId } from '@lib/actions/place-state';
import { getAllPlacesByRequestId } from '@repo/place-state';

const MyRequestDetailsSearches = () => {
  const [placeStates, setPlaceStates] = useState<
    Prisma.PromiseReturnType<typeof getAllPlacesByRequestId>
  >([]);
  const [error, setError] = useState<string | null>(null);

  const [partialPlaceStates, setPartialPlaceStates] = useState<
    Prisma.PromiseReturnType<typeof getAllPlacesByRequestId>
  >([]);

  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchSearch = async (id: SearchRequest['id']) => {
      const [data, error] = await getAllPlaceStateByRequestId(id);
      if (data === undefined) {
        setError(error);
      } else if (data.length === 0) {
        setError("There's no data to display.");
      } else {
        setPlaceStates(
          data.toSorted((a, b) => {
            if (a.state === State.Favorite && b.state !== State.Favorite)
              return -1;
            if (a.state !== State.Favorite && b.state === State.Favorite)
              return 1;
            if (a.state === State.New && b.state !== State.New) return -1;
            if (a.state !== State.New && b.state === State.New) return 1;
            return a.place.price - b.place.price;
          }),
        );
      }
    };

    const id = searchParams.get('requestId');
    if (id === null) {
      setError('requestId is missing!');
      return;
    }
    fetchSearch(id).catch(() => setError("Couldn't fetch search data."));
  }, [searchParams]);

  const cards = partialPlaceStates
    .filter((placeState) => {
      return placeState.state !== State.Hidden;
    })
    .map((placeState) => {
      return (
        <SingleCardInfo
          key={placeState.id}
          placeState={placeState}
          setError={setError}
          chgPlaceState={(placeState) => {
            setPartialPlaceStates((prevSearch) => {
              return prevSearch.map((o) => {
                if (o.id === placeState.id) {
                  return {
                    ...placeState,
                  };
                }
                return o;
              });
            });
          }}
        />
      );
    });

  return (
    <main>
      <section className="p-4">
        {error ? (
          <div className="text-red-500 text-sm font-bold">{error}</div>
        ) : null}
        <InfiniteScroll
          className="grid lg:grid-cols-2 grid-cols-1 gap-4 justify-around"
          pageStart={0}
          loadMore={() => {
            setPartialPlaceStates(
              placeStates.slice(0, partialPlaceStates.length + 5),
            );
          }}
          hasMore={partialPlaceStates.length < placeStates.length}
          loader={
            <div className="loader" key={0}>
              Loading ...
            </div>
          }
        >
          {cards}
        </InfiniteScroll>
      </section>
    </main>
  );
};

export default MyRequestDetailsSearches;
