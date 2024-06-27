import { DataErrorType } from '@lib/interfaces/data-error';
import { dateDiffInDays } from '@lib/tools/date';

export const validateStartEndDate = <T extends Date>(
  dateStart: T | undefined,
  dateEnd: T | undefined,
  daysLimit = 30,
): DataErrorType<{ dateStart: T; dateEnd: T }> => {
  if (dateStart === undefined || dateEnd === undefined) {
    return [undefined, 'Please select the duration of the search'];
  }

  if (dateStart > dateEnd) {
    return [undefined, 'Start date should be before end date'];
  }

  if (dateDiffInDays(dateStart, dateEnd) > daysLimit) {
    return [
      undefined,
      `Duration should be less than ${daysLimit.toString()} days`,
    ];
  }

  return [{ dateStart, dateEnd }, undefined];
};

export const isEmpty = (value: string | undefined): value is undefined => {
  return value === undefined || value.trim() === '';
};
