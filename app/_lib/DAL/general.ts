import { User } from '@prisma/client';

import { prisma } from '@lib/DAL/prisma';
import { auth } from '@lib/auth';
import { DataErrorType } from '@lib/interfaces/data-error';
import { errorWrapperAsync } from '@lib/tools/general';

export const getAuthenticatedUser = async (): Promise<DataErrorType<User>> => {
  
  const [user, error] = await errorWrapperAsync<User | null>(async () => {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error('You are not authorized');
    }
    return prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });
  });

  if (error) return [undefined, error];
  if (!user) return [undefined, 'User not found'];
  return [user, undefined];
};
