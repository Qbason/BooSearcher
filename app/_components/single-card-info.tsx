import { Image } from '@nextui-org/react';
import { Prisma, State } from '@prisma/client';
import { Dispatch, SetStateAction } from 'react';
import { BiHide } from 'react-icons/bi';
import { MdFavorite } from 'react-icons/md';
import { RxOpenInNewWindow } from 'react-icons/rx';

import { changePlaceState } from '@lib/actions/place-state';

const SingleCardInfo = ({
  placeState,
  setError,
  chgPlaceState,
}: {
  placeState: Prisma.PlaceStateGetPayload<{
    include: {
      place: true;
    };
  }>;
  setError: Dispatch<SetStateAction<string | null>>;
  chgPlaceState: (
    placeState: Prisma.PlaceStateGetPayload<{
      include: { place: true };
    }>,
  ) => void;
}) => {
  let borderColor = 'border border-grey-500';
  if (placeState.state === State.New) {
    borderColor = 'border border-blue-500';
  } else if (placeState.state === State.Favorite) {
    borderColor = 'border border-yellow-500';
  }

  const chgToSeen = async (
    placeState: Prisma.PlaceStateGetPayload<{
      include: { place: true };
    }>,
  ) => {
    if (placeState.state === State.New) {
      const [_, error] = await changePlaceState(placeState.id, State.Seen);
      if (error) {
        setError(error);
        return;
      }

      chgPlaceState({
        ...placeState,
        state: State.Seen,
      });
    }
  };

  const chgToFav = async (
    placeState: Prisma.PlaceStateGetPayload<{
      include: { place: true };
    }>,
  ) => {
    const newState =
      placeState.state === State.Favorite ? State.Seen : State.Favorite;

    const [_, error] = await changePlaceState(placeState.id, newState);
    if (error) {
      setError(error);
      return;
    }
    chgPlaceState({
      ...placeState,
      state: newState,
    });
  };

  const chgToHidden = async (
    placeState: Prisma.PlaceStateGetPayload<{
      include: { place: true };
    }>,
  ) => {
    const newState =
      placeState.state === State.Hidden ? State.Seen : State.Hidden;

    const [_, error] = await changePlaceState(placeState.id, newState);
    if (error) {
      setError(error);
      return;
    }
    chgPlaceState({
      ...placeState,
      state: newState,
    });
  };

  return (
    <div
      key={placeState.place.id}
      className={`${borderColor} flex flex-col items-center rounded md:flex-row md:h-[250px] md:items-stretch 
      ${placeState.state === State.New ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={() => {
        void chgToSeen(placeState);
      }}
      onKeyDown={() => {
        void chgToSeen(placeState);
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex h-[250px] w-[250px] items-end">
        <Image
          alt="Object"
          className="object-cover rounded"
          src={placeState.place.image}
          width={250}
          height={250}
        />
      </div>
      <div className="flex flex-1 justify-around items-center flex-col p-2 gap-1">
        <div className="flex items-center">
          <h4 className="font-bold text-xl" title={placeState.place.title}>
            {placeState.place.title && placeState.place.title.length > 25
              ? `${placeState.place.title.slice(0, 25)}...`
              : placeState.place.title}
          </h4>
        </div>
        <div className="flex w-[100%] flex-row items-baseline justify-around">
          <div className="flex flex-col items-start">
            <p className="text-tiny uppercase font-bold">
              {placeState.place.address}
            </p>
            <small className="text-default-500">
              {placeState.place.price} zł
            </small>
            <small className="text-default-500">
              Number of opinions: {placeState.place.numberOfOpinions}
            </small>
            <small className="text-default-500">
              Rating: {placeState.place.reviewScore}
            </small>
            {placeState.place.stars ? (
              <small className="text-default-500">
                Stars: {placeState.place.stars}
              </small>
            ) : null}
          </div>
          <div>
            {placeState.place.features.length > 0 ? (
              <div className="flex flex-col justify-start items-start">
                <div>Features:</div>
                <div className="ps-2 text-default-500 text-xs flex flex-col">
                  {placeState.place.features.map((feature) => (
                    <li key={feature.name}>{feature.name}</li>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="py-2 gap-2 flex flex-row justify-center w-[225px]">
          <div className="border border-gray-500 rounded-md p-2 cursor-pointer">
            <MdFavorite
              color={placeState.state === State.Favorite ? '#F31260' : 'white'}
              className={
                placeState.state !== State.Favorite
                  ? 'hover:bg-[#F31260] rounded-full p-1'
                  : ''
              }
              size="20"
              onClick={() => {
                void chgToFav(placeState);
              }}
            />
          </div>
          <div className="border border-gray-500 rounded-md p-2 cursor-pointer hover:bg-gray-300 hover:text-black">
            <BiHide
              size="20"
              className="p-[1px]"
              onClick={() => {
                void chgToHidden(placeState);
              }}
            />
          </div>
          <div className="border border-gray-500 rounded-md p-2 cursor-pointer hover:bg-gray-300 hover:text-black">
            <RxOpenInNewWindow
              size="20"
              onClick={() => {
                placeState.place.url &&
                  window.open(placeState.place.url, '_blank');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { SingleCardInfo };
