import { Prisma, Status } from '@prisma/client';
import { createTransport } from 'nodemailer';

import { BookingSearcher } from '@lib/core/Searchers/booking';
import { errorWrapperAsync } from '@lib/tools/general';
import { Logger } from '@lib/tools/logger';
import {
  addSearchToSearchRequest,
  getSearchRequestForSearcher,
  updateStateRequests,
} from '@repo/search-request';

export class Watcher {
  private static _instance: Watcher | null = null;

  private _isRunning = false;
  private _localTimeout: NodeJS.Timeout | null = null;

  public static getInstance(): Watcher {
    if (!Watcher._instance) {
      Watcher._instance = new Watcher();
    }

    return Watcher._instance;
  }

  private constructor() {
    setInterval(
      async () => {
        await errorWrapperAsync(async () => {
          await updateStateRequests();
        });
      },
      1000 * 60 * 60 * 24,
    );
  }

  private async _run() {
    if (this._isRunning) {
      return;
    }
    this._isRunning = true;
    await errorWrapperAsync(async () => {
      let actualSearchRequest: Prisma.SearchRequestGetPayload<{
        select: {
          id: true;
          url: true;
          user: {
            select: {
              email: true;
            };
          };
        };
      }> | null = await getSearchRequestForSearcher();

      const bookingSearcher = BookingSearcher.getInstance();

      while (actualSearchRequest !== null) {
        const searcherData = await bookingSearcher
          .init(actualSearchRequest.url)
          .runBrowserAndFindOffers();

        if (searcherData === null) {
          await addSearchToSearchRequest(actualSearchRequest.id, {
            dateStart: new Date(),
            dateEnd: new Date(),
            duration: 0,
            offersCount: 0,
            status: Status.Failed,
            offersFound: [],
          });
        } else {
          const newOffers = await addSearchToSearchRequest(
            actualSearchRequest.id,
            searcherData,
          );
          if (actualSearchRequest.user.email === null) {
            Logger.getInstance().error("User's email is null!");
          } else {
            const host = process.env.EMAIL_SERVER_HOST;
            const port = process.env.EMAIL_SERVER_PORT;
            const user = process.env.EMAIL_SERVER_USER;
            const pass = process.env.EMAIL_SERVER_PASSWORD;
            if (!host || !port || !user || !pass) {
              Logger.getInstance().error('Email server data is not set!');
              return;
            }
            createTransport({
              service: 'Gmail',
              host,
              port: Number(port),
              secure: true,
              auth: {
                user,
                pass,
              },
            })
              .sendMail({
                from: process.env.EMAIL_FROM,
                to: actualSearchRequest.user.email,
                subject: 'New offers found!',
                html: `
                  <h1>New offers found!</h1>
                  <p>There are ${newOffers.length.toString()} new offers for your search request.</p>     
                  `,
              })
              .catch((e: unknown) => {
                Logger.getInstance().error(e);
              });
          }
        }

        actualSearchRequest = await getSearchRequestForSearcher();
      }
    });
    this._isRunning = false;

    if (this._localTimeout) {
      clearTimeout(this._localTimeout);
    }

    this._localTimeout = setTimeout(async () => {
      await this._run();
      this._localTimeout = null;
    }, 60 * 1000);
  }

  async trigger() {
    if (this._localTimeout) {
      clearTimeout(this._localTimeout);
    }
    await this._run();
  }
}
