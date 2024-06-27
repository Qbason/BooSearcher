'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { SearchRequest } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getAllRequests } from '@lib/actions/search-request';

const MyRequests = () => {
  const router = useRouter();

  const [requests, setRequests] = useState<
    {
      created: SearchRequest['created'];
      id: SearchRequest['id'];
      name: SearchRequest['name'];
      url: SearchRequest['url'];
      searchesCount: SearchRequest['searchesCount'];
    }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setError(null);
      const [requests, error] = await getAllRequests();
      if (error) {
        setError(error);
      }
      if (requests) {
        setRequests(
          requests.map((el) => {
            return {
              ...el,
              url: el.url.split('?').at(1) ?? '',
            };
          }),
        );
      }
    };

    fetchRequests().catch((e: unknown) => {
      setError(e instanceof Error ? e.message : 'Unknown error');
    });
  }, []);

  const rows = requests.map((request) => (
    <TableRow
      key={request.id}
      onClick={() => {
        router.push(`/myRequests/${request.id}`);
      }}
      className="cursor-pointer hover:bg-gray-800"
    >
      <TableCell>{request.name}</TableCell>
      <TableCell>{request.created.toDateString()}</TableCell>
      <TableCell>{request.url}</TableCell>
      <TableCell>{request.searchesCount}</TableCell>
    </TableRow>
  ));

  return (
    <main>
      <Table aria-label="My request table">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>CREATED</TableColumn>
          <TableColumn>URL</TableColumn>
          <TableColumn>NUMBERS OF SEARCHES</TableColumn>
        </TableHeader>
        <TableBody>{rows}</TableBody>
      </Table>
      {error ? <p className="text-red-500 text-sm font-bold">{error}</p> : null}
    </main>
  );
};

export default MyRequests;
