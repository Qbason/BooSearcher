'use client';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getRequest } from '@lib/actions/search-request';
import { SearchRequestWithSearches } from '@lib/interfaces/request';

const MyRequestDetail = ({ params }: { params: { id: string } }) => {
  const router = useRouter();

  const [request, setRequest] = useState<SearchRequestWithSearches | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      const [requestData, errorRequest] = await getRequest(params.id);
      if (requestData === undefined) {
        setError(errorRequest);
      } else {
        requestData?.searches.sort((a, b) => {
          return b.dateStart.getTime() - a.dateStart.getTime();
        });
        setRequest(requestData);
      }
    };
    fetchRequest().catch(() => setError("Couldn't fetch request data."));
  }, [params.id]);

  const searchParams =
    request &&
    Array.from(new URL(request.url).searchParams).map(([key, value]) => {
      return (
        <TableRow key={key}>
          <TableCell>{key}</TableCell>
          <TableCell>{value}</TableCell>
        </TableRow>
      );
    });

  const searches = request?.searches.map((search) => {
    return (
      <TableRow
        key={`${search.dateStart.getTime().toString()}-${search.dateEnd.getTime().toString()}`}
        onClick={() => {
          router.push(`/mySearches/${search.id}`);
        }}
        className="cursor-pointer hover:bg-gray-800"
      >
        <TableCell>
          {`${search.dateStart.toDateString()} ${search.dateStart.toLocaleTimeString()}`}
        </TableCell>
        <TableCell>{`${search.dateEnd.toDateString()} ${search.dateEnd.toLocaleTimeString()}`}</TableCell>
        <TableCell>{search.duration}</TableCell>
        <TableCell>{search.offersCount}</TableCell>
        <TableCell>{search.status}</TableCell>
      </TableRow>
    );
  });

  return (
    <main className="flex flex-row grow p-4 gap-4">
      {request ? (
        <>
          <section className="flex flex-col justify-start items-center">
            <Card className="max-w-[400px]">
              <CardHeader className="flex flex-col justify-center items-center">
                <div className="text-md">Request details</div>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row flex-wrap gap-2">
                    <div className="flex flex-1 flex-col justify-center items-center border rounded-lg p-1">
                      <div>Request name:</div>
                      <div className="text-center">{request.name}</div>
                    </div>
                    <div className="flex flex-1 flex-col justify-center items-center border rounded-lg p-1">
                      <div>Searches count:</div>
                      <div>{request.searchesCount}</div>
                    </div>
                    <div className="flex w-full flex-col justify-center items-center border rounded-lg p-1">
                      <div>Request created at:</div>
                      <div>{`${request.created.toDateString()} ${request.created.toLocaleTimeString()}`}</div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-center border rounded-lg">
                    <div className="grow text-center font-bold pt-1">
                      Params from url:
                    </div>
                    <Table>
                      <TableHeader>
                        <TableColumn>Key</TableColumn>
                        <TableColumn>Value</TableColumn>
                      </TableHeader>
                      <TableBody>{searchParams ?? []}</TableBody>
                    </Table>
                  </div>
                </div>
              </CardBody>
              <Divider />
              <CardFooter className="flex justify-around items-center">
                <Link isExternal showAnchorIcon href={request.url}>
                  Request url
                </Link>
                <Link href={`/myPlaceStates?requestId=${request.id}`}>
                  All places
                </Link>
              </CardFooter>
            </Card>
          </section>

          <section className="flex grow flex-col justify-center items-center">
            <Table aria-label="Example static collection table">
              <TableHeader>
                <TableColumn>Date start</TableColumn>
                <TableColumn>Date end</TableColumn>
                <TableColumn>Duration</TableColumn>
                <TableColumn>Number of offers</TableColumn>
                <TableColumn>Status</TableColumn>
              </TableHeader>
              <TableBody>{searches ?? []}</TableBody>
            </Table>
          </section>
        </>
      ) : null}
      {error ? <p className="text-red-500 text-sm font-bold">{error}</p> : null}
    </main>
  );
};

export default MyRequestDetail;
