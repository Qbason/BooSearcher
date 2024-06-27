'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { Search } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getAllSearches } from '@lib/actions/search-request';

const MySearches = () => {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [searches, setSearches] = useState<Search[]>([]);

  useEffect(() => {
    const getSeaches = async () => {
      const [data, error] = await getAllSearches();
      if (error !== undefined) {
        setError(error);
      } else {
        setSearches(data);
      }
    };
    getSeaches().catch(() => setError("Couldn't fetch searches data."));
  }, []);

  const searchesTableRows = searches.map((search) => {
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
    <main>
      <section className="flex grow flex-col justify-center items-center p-4">
        <Table aria-label="Example static collection table">
          <TableHeader>
            <TableColumn>Date start</TableColumn>
            <TableColumn>Date end</TableColumn>
            <TableColumn>Duration</TableColumn>
            <TableColumn>Number of offers</TableColumn>
            <TableColumn>Status</TableColumn>
          </TableHeader>
          <TableBody>{searchesTableRows}</TableBody>
        </Table>
      </section>
      {error ? <p className="text-red-500 text-sm font-bold">{error}</p> : null}
    </main>
  );
};

export default MySearches;
