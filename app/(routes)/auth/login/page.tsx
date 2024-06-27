import { auth, signIn } from '@lib/auth';

const Signin = async () => {
  const session = await auth();

  if (!session) {
    await signIn();
  }
  return <div />;
};

export default Signin;
