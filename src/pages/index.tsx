import { type NextPage } from "next";
import Head from "next/head";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
const Home: NextPage = () => {
  const user = useUser();

  return (
    <>
      <Head>
        <title>Sora Union</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        {!user.isSignedIn && <SignInButton>Sign in with Clerk </SignInButton>}
        {!!user.isSignedIn && <SignOutButton />}
      </main>
    </>
  );
};

export default Home;
