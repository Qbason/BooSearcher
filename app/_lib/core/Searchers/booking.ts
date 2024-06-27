import { Prisma, Status } from '@prisma/client';
// import puppeteer, { ElementHandle, Page, Puppeteer, launch } from 'puppeteer';
import { ElementHandle, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import { Logger } from '@lib/tools/logger';

class BookingSearcher {
  private static _instance: BookingSearcher | null = null;
  private _baseUrl = '';

  readonly ELEMENTS_QUERY = {
    offer: '[data-testid="property-card"]',
    title: '[data-testid="title"]',
    price: '[data-testid="price-and-discounted-price"]',
    link: '[data-testid="title-link"]',
    image: '[data-testid="image"]',
    reviewScoreAndOpinions: '[data-testid="review-score"]',
    externalReviewScoreAndOpinions: '[data-testid="external-review-score"]',
    address: '[data-testid="address"]',
    stars: '[data-testid="rating-squares"]',
    features: '[data-testid="property-card-unit-configuration"]',
    sortByNotice: '[data-testid="notices-container"]',
    notFoundOffers: '[data-testid="properties-list-empty-state"]',
  };

  public static getInstance() {
    if (!BookingSearcher._instance) {
      BookingSearcher._instance = new BookingSearcher();
    }
    return BookingSearcher._instance;
  }

  init(url: string) {
    this._baseUrl = url;
    return this;
  }

  private _extractTitle = async (el: ElementHandle) => {
    const titleElement = await el.$(this.ELEMENTS_QUERY.title);
    const title =
      (await titleElement?.evaluate((el) => (el as HTMLElement).innerText)) ??
      null;
    return title;
  };

  private _extractPrice = async (el: ElementHandle) => {
    const priceElement = await el.$(this.ELEMENTS_QUERY.price);
    if (!priceElement) {
      return null;
    }
    const priceString = await priceElement.evaluate((element) => {
      return (element as HTMLElement).innerText
        .split(' ')
        .at(0)
        ?.replace(' ', '')
        .replace(',', '');
    });

    if (priceString === undefined) {
      return null;
    }

    try {
      return parseInt(priceString);
    } catch {
      Logger.getInstance().error('Error with price!', priceString);
      return null;
    }
  };

  private _extractLink = async (el: ElementHandle) => {
    const linkElement = await el.$(this.ELEMENTS_QUERY.link);
    const link =
      (await linkElement?.evaluate((el) =>
        (el as HTMLAnchorElement).getAttribute('href'),
      )) ?? null;
    return link;
  };

  private _extractImage = async (el: ElementHandle) => {
    const imageElement = await el.$(this.ELEMENTS_QUERY.image);
    const image =
      (await imageElement?.evaluate((el) =>
        (el as HTMLImageElement).getAttribute('src'),
      )) ?? null;
    return image;
  };

  private _extractReviewScore = async (el: ElementHandle) => {
    const reviewScoreElement = await el.$(
      this.ELEMENTS_QUERY.reviewScoreAndOpinions,
    );

    if (reviewScoreElement !== null) {
      const reviewScore: string | null = await reviewScoreElement.evaluate(
        (element) => {
          return (
            (element as HTMLUListElement).firstChild as HTMLElement
          ).innerText.replace(',', '.');
        },
      );
      const reviewScoreNumber = reviewScore ? parseFloat(reviewScore) : null;
      return reviewScoreNumber;
    }

    const externalReviewScoreElement = await el.$(
      this.ELEMENTS_QUERY.externalReviewScoreAndOpinions,
    );
    if (externalReviewScoreElement === null) {
      return null;
    }
    const externalReviewScore = await externalReviewScoreElement.evaluate(
      (el) => {
        return (el as HTMLElement).firstChild?.firstChild?.textContent
          ?.split(' ')
          .at(1)
          ?.replace(',', '.');
      },
    );
    if (externalReviewScore === undefined) {
      return null;
    }
    return parseFloat(externalReviewScore);
  };

  private _extractAddress = async (el: ElementHandle) => {
    const addressElement = await el.$(this.ELEMENTS_QUERY.address);
    const address =
      (await addressElement?.evaluate((element) => {
        return (element as HTMLElement).innerText;
      })) ?? null;
    return address;
  };

  private _extractOpinionsNumber = async (el: ElementHandle) => {
    const opinionsNumberElement = await el.$(
      this.ELEMENTS_QUERY.reviewScoreAndOpinions,
    );

    if (opinionsNumberElement !== null) {
      const opinionsNumber = await opinionsNumberElement.evaluate((element) => {
        if (element.childNodes.length < 2) {
          return 0;
        }
        const tempElement = element.childNodes.item(1);
        if (tempElement.childNodes.length < 2) {
          return 0;
        }
        const value = (
          tempElement.childNodes.item(1) as HTMLElement
        ).textContent
          ?.split(' ')
          .at(0);
        return value ? parseInt(value) : 0;
      });

      return opinionsNumber;
    }

    const opinionsNumberExternalElement = await el.$(
      this.ELEMENTS_QUERY.externalReviewScoreAndOpinions,
    );

    if (opinionsNumberExternalElement === null) {
      return 0;
    }

    const value = await opinionsNumberExternalElement.evaluate((el) => {
      return (el as HTMLElement).firstChild?.lastChild?.textContent
        ?.split(' ')
        .at(0);
    });
    if (value === undefined) {
      return 0;
    }
    return parseInt(value);
  };

  private _extractStars = async (el: ElementHandle) => {
    const starsElement = await el.$(this.ELEMENTS_QUERY.stars);
    const stars =
      (await starsElement?.evaluate((element) => {
        return element.children.length;
      })) ?? null;

    return stars;
  };

  private _extractFeatures = async (el: ElementHandle) => {
    const featuresElement = await el.$(
      '[data-testid="property-card-unit-configuration"]',
    );
    const features =
      (await featuresElement?.evaluate((element) => {
        return [
          ...[...element.children].map((el) => {
            return el.textContent;
          }),
        ];
      })) ?? null;
    return features ? features.filter((el) => el !== null) : [];
  };

  private _extractOffer = async (
    el: ElementHandle,
  ): Promise<Prisma.PlaceCreateWithoutPlacesStateInput | null> => {
    const [
      title,
      url,
      price,
      reviewScore,
      numberOfOpinions,
      address,
      stars,
      features,
      image,
    ] = await Promise.all([
      this._extractTitle(el),
      this._extractLink(el),
      this._extractPrice(el),
      this._extractReviewScore(el),
      this._extractOpinionsNumber(el),
      this._extractAddress(el),
      this._extractStars(el),
      this._extractFeatures(el),
      this._extractImage(el),
    ]);

    if (
      title === null ||
      price === null ||
      image === null ||
      url === null ||
      address === null
    ) {
      Logger.getInstance().error('Error while extracting offer');
      Logger.getInstance().error(title, price, image, url, address);
      return null;
    }

    const urlObject = new URL(url);
    const urlId = urlObject.host + urlObject.pathname;

    return {
      title,
      urlId,
      url,
      price,
      reviewScore,
      numberOfOpinions,
      address,
      stars,
      features: features
        .filter((el): el is string => {
          return el !== null;
        })
        .map((el) => {
          return { name: el };
        }),
      image,
    };
  };

  private _extractNumberOfOffers = async (page: Page) => {
    const elementToFind = await page.$(this.ELEMENTS_QUERY.sortByNotice);

    if (elementToFind === null) {
      return 0;
    }
    // const element = el as HTMLElement;
    return await elementToFind.evaluate((el) => {
      const element = el as HTMLElement;
      const textNumberOfOffers =
        element.parentElement?.parentElement?.parentElement?.childNodes
          .item(0)
          .childNodes.item(0).textContent;
      if (textNumberOfOffers) {
        return Number(
          textNumberOfOffers.split(' ').find((el) => !isNaN(parseInt(el))) ?? 0,
        );
      }
      return 0;
    });
  };

  private _areOffersNotFound = async (page: Page) => {
    const notFoundOffers = await page.$(this.ELEMENTS_QUERY.notFoundOffers);
    return notFoundOffers !== null;
  };

  private async _areOffersLoaded(page: Page) {
    let numberOfFails = 0;
    while (numberOfFails < 5) {
      try {
        await page.waitForSelector(this.ELEMENTS_QUERY.offer, {
          timeout: 10000,
        });
        return true;
      } catch (e) {
        Logger.getInstance().error('Error while waiting for offers to load');
        numberOfFails++;
        await page.reload();
      }
    }
    return false;
  }

  private async _goToPageSetPageOptions(page: Page) {
    // await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(this._baseUrl, {
      waitUntil: 'domcontentloaded',
    });
  }

  private _findClickLoadMore = async (page: Page) => {
    return await page.evaluate(() => {
      const parentElement = document.querySelector(
        '[data-testid="property-card"]',
      )?.parentElement;
      const elementsLength = parentElement?.childNodes.length;
      if (!parentElement || !elementsLength) {
        return null;
      }
      if (elementsLength > 0) {
        const loadMore = parentElement.childNodes.item(
          elementsLength - 1,
        ) as HTMLElement;
        const button = loadMore.querySelector('button');
        if (!button) return null;
        if (button.innerText.length > 0) {
          button.click();
          return button;
        }
      }
      return null;
    });
  };

  private _autoScroll(page: Page) {
    return new Promise((resolve) => {
      (async () => {
        let scrollHeight = -1;

        while (
          scrollHeight !==
          (await page.evaluate(() => {
            return window.document.body.scrollHeight;
          }))
        ) {
          scrollHeight = await page.evaluate(() => {
            return window.document.body.scrollHeight;
          });
          Logger.getInstance().info(`Scrolling to ${scrollHeight.toString()}`);
          await page.evaluate(() => {
            window.scrollTo(0, window.document.body.scrollHeight);
          });

          await new Promise((resolveInternal) => {
            setTimeout(resolveInternal, 1000);
          });

          while (
            await page.evaluate(() => {
              return (
                document.querySelector('[data-testid="skeleton-loader"]') !==
                null
              );
            })
          ) {
            await new Promise((resolveInternal) => {
              setTimeout(resolveInternal, 1000);
            });
          }
          await this._findClickLoadMore(page);
          await new Promise((resolveInternal) => {
            setTimeout(resolveInternal, 100);
          });
        }
        resolve(void 0);
      })().catch(() => {
        Logger.getInstance().error('autoScroll error');
      });
    });
  }

  private async _skeletonDisappears(page: Page) {
    await new Promise((resolve) => {
      (async () => {
        let element: null | boolean = true;

        const id = setTimeout(() => {
          Logger.getInstance().warn('Skeleton loader timeout');
          resolve(void 0);
        }, 20000);

        while (element) {
          element = await page.evaluate(() => {
            return (
              document.querySelector('[data-testid="skeleton-loader"]') !== null
            );
          });
          if (element) {
            await new Promise((resolveInternal) => {
              setTimeout(resolveInternal, 1000);
            });
          }
        }
        clearTimeout(id);
        resolve(void 0);
      })().catch(() => {
        Logger.getInstance().error('Skeleton loader error');
        resolve(void 0);
      });
    });
  }

  async runBrowserAndFindOffers() {
    const timeStart = new Date();

    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      ignoreDefaultArgs: ['--disable-extensions'],
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();

    const allOffers: Prisma.PlaceCreateWithoutPlacesStateInput[] = [];

    await this._goToPageSetPageOptions(page);

    if (!(await this._areOffersLoaded(page))) {
      await page.screenshot({
        path: `screenshot_${crypto.randomUUID()}.png`,
      });
      Logger.getInstance().error('Offers not loaded!');
      return null;
    }

    await this._autoScroll(page);
    await this._skeletonDisappears(page);

    const foundOffers: number = await this._extractNumberOfOffers(page);

    if (foundOffers === 0) {
      const areOffersNotFound = await this._areOffersNotFound(page);

      if (!areOffersNotFound) {
        await page.screenshot({
          path: `screenshot_${crypto.randomUUID()}.png`,
        });
      }

      await browser.close();
      return {
        dateStart: timeStart,
        dateEnd: new Date(),
        duration: 0,
        offersCount: 0,
        status: Status.Failed,
        offersFound: [],
      };
    }

    const offers = await page.$$(this.ELEMENTS_QUERY.offer);
    const offersFullInfo = (
      await Promise.all(
        offers.map(async (el) => {
          return await this._extractOffer(el);
        }),
      )
    ).filter((el): el is Prisma.PlaceCreateWithoutPlacesStateInput => {
      return el !== null;
    });

    allOffers.push(...offersFullInfo);
    await browser.close();
    const timeEnd = new Date();
    const duration = (timeEnd.getTime() - timeStart.getTime()) / 1000;

    Logger.getInstance().info('Offers found: ', allOffers.length);
    return {
      dateStart: timeStart,
      dateEnd: timeEnd,
      duration,
      offersCount: allOffers.length,
      status: Status.Success,
      offersFound: allOffers,
    };
  }
}

export { BookingSearcher };
