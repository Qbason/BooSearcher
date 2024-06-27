'use client';

import { getLocalTimeZone, today } from '@internationalized/date';
import {
  Button,
  DateRangePicker,
  DateValue,
  Input,
  Link,
  Spinner,
} from '@nextui-org/react';
import { useEffect, useState } from 'react';

import { addNewSearch } from '@lib/actions/general';
import { isEmpty, validateStartEndDate } from '@lib/tools/validators';

const Home = () => {
  const [data, setData] = useState<{
    name?: string;
    url?: string;
    startDate?: DateValue;
    endDate?: DateValue;
  }>({
    name: undefined,
    url: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const [startEndDate, errorStartEndDate] = validateStartEndDate(
      data.startDate?.toDate(getLocalTimeZone()),
      data.endDate?.toDate(getLocalTimeZone()),
      30,
    );
    if (errorStartEndDate !== undefined) {
      setError(errorStartEndDate);
      setIsLoading(false);
      return;
    }

    if (isEmpty(data.name) || isEmpty(data.url)) {
      setError('Please fill all the fields');
      setIsLoading(false);
      return;
    }

    setError(null);
    const [id, error] = await addNewSearch(
      data.name,
      data.url,
      startEndDate.dateStart,
      startEndDate.dateEnd,
    );
    if (error !== undefined) {
      setError(error);
    }
    if (id) {
      setRequestId(id);
    }
    setIsLoading(false);
  };

  const chgData = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    setData((prev) => {
      return {
        ...prev,
        startDate: today(getLocalTimeZone()),
        endDate: today(getLocalTimeZone()).add({ days: 1 }),
      };
    });
  }, []);

  return (
    <main className="flex flex-col items-center justify-center grow">
      <section className="flex flex-col items-center justify-center">
        {isLoading ? (
          <Spinner label="Request is handling" />
        ) : (
          <form
            className="flex flex-col items-center justify-center gap-5"
            onSubmit={handleSubmit}
          >
            <Input
              name="name"
              placeholder="Name of your search"
              size="md"
              onChange={chgData}
              autoComplete="off"
            />
            <Input
              name="url"
              placeholder="Copy and paste your link here"
              size="lg"
              onChange={chgData}
              autoComplete="off"
            />
            <DateRangePicker
              aria-label="Searching duration (max 30 days)"
              label="Searching duration (max 30 days)"
              labelPlacement="inside"
              value={
                data.startDate && data.endDate
                  ? {
                      start: data.startDate,
                      end: data.endDate,
                    }
                  : null
              }
              description="Select the start and end date of your search"
              onChange={(value) => {
                setData((prev) => {
                  return {
                    ...prev,
                    startDate: value.start,
                    endDate: value.end,
                  };
                });
              }}
            />
            <Button type="submit" color="primary">
              Add request
            </Button>
            <div>
              {error ? (
                <div className="text-red-500 text-sm font-bold">{error}</div>
              ) : null}
            </div>
          </form>
        )}
        {requestId ? (
          <div className="flex items-center justify-center flex-col gap-3">
            <div className="text-green-500 text-sm font-bold">
              Your request was added. You can check the status of your request
              here:
            </div>
            <Button color="success">
              <Link href={`/myRequests/${requestId}`}>Check</Link>
            </Button>
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default Home;
