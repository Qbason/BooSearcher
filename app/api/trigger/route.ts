import { Watcher } from '@lib/core/watcher';

export const GET = () => {
  void Watcher.getInstance().trigger();
  return new Response('', {
    status: 200,
  });
};
