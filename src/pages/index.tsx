import { type NextPage } from "next";
import Head from "next/head";

import { SignInButton, useUser } from "@clerk/nextjs";
import { Loading, LoadingSpinner } from "../components/Loading";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";

dayjs.extend(relativeTime);

const CreateRocketWizard = () => {
  const [rocketTitle, setRocketTitle] = useState<string>("");

  const [rocketDescription, setRocketDescription] = useState<string>("");

  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isRocketing } = api.rockets.create.useMutation({
    onSuccess: () => {
      setRocketDescription("");
      setRocketTitle("");
      void ctx.rockets.getAll.invalidate()
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors;
      // toast error message if it is from the server
      if (errorMessage) {
        toast.error(" Please  check your form inputs  ")
      }
      else {
        toast.error("Something went wrong")
      }
    }
  });

  if (!user) return null

  return (
    <div className="flex gap-3 w-full" >
      <Image src={user.profileImageUrl} alt="profile image"
        className="w-14 h-14 rounded-full"
        width={56}
        height={56}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAA"
      />
      <div className="flex flex-col w-full">
        <input type="text" placeholder="rocket title" className="bg-transparent grow outline-none"
          value={rocketTitle}
          onChange={(e) => setRocketTitle(e.target.value)}
          disabled={isRocketing}
        />
        <input type="text" placeholder="rocket description" className="bg-transparent grow outline-none border w-11/12 border-rose-100 px-2"
          value={rocketDescription}
          onChange={(e) => setRocketDescription(e.target.value)}
          disabled={isRocketing}
        />
      </div>
      {
        rocketTitle != "" && !isRocketing && (
          <button className="bg-rose-100 text-rose-500 rounded-full p-2 w-32"
            onClick={() => {
              mutate({
                title: rocketTitle,
                description: rocketDescription,
              })
            }
            }
          >Add</button>
        )
      }
      {
        isRocketing && (
          <div className="flex items-center justify-center">
            <LoadingSpinner size={40} />
          </div>
        )
      }
    </div>
  )

}

type RocketWithUser = RouterOutputs["rockets"]["getAll"][number];

const RocketView = (props: RocketWithUser) => {
  const { rocket, author } = props;

  const { mutate: updateMutate } = api.rockets.update.useMutation({
    onSuccess: () => {
      void ctx.rockets.getAll.invalidate()
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors;
      // toast error message if it is from the server
      if (errorMessage) {
        toast.error(" Please  check your form inputs  ")
      }
      else {
        toast.error("Something went wrong")
      }
    }
  });

  const ctx = api.useContext();
  const { mutate: deleteMutate } = api.rockets.delete.useMutation({
    onSuccess: () => {
      toast.success("Deleted successfully")
      void ctx.rockets.getAll.invalidate()
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors;
      // toast error message if it is from the server
      if (errorMessage) {
        toast.error(" Please  check your form inputs  ")
      }
      else {
        toast.error("Something went wrong")
      }
    }
  });
  return (
    <div className="border-b border-slate-400 p-4 flex gap-3" key={rocket.id}>
      <Image
        width={56}
        height={56}
        className="w-14 h-14 rounded-full"
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAA"
        src={author.profilePicture} alt="profile image" />
      <div className="flex flex-col w-full">
        <div className="flex text-slate-400 font-bold gap-2">
          <span>{`@${author.name}`}</span>
          <span className=" font-thin">{`· ${dayjs(rocket.createdAt).fromNow()}`}</span>
        </div>
        <span className=" text-2xl">{rocket?.description}</span>
      </div>
      <div className="flex flex-col self-end">
        <button className="text-rose-100 p-2"
          onClick={() => {
            // bind data to the form
          }}
        >
          <FaEdit />
        </button>
        <button className="text-rose-100 p-2"
          onClick={() =>  deleteMutate({ id: rocket.id })}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  )

}

const Feed = () => {
  const { data, isLoading: rocketLoading } = api.rockets.getAll.useQuery();

  if (rocketLoading) return <Loading />

  if (!data) return <div>Something goes wrong!</div>

  return (
    <div>
      {data.map((rocketDetail) => (
        <RocketView {...rocketDetail} key={rocketDetail.rocket.id} />
      ))}
    </div>
  )
}
const Home: NextPage = (props) => {

  const { user, isLoaded: userLoaded, isSignedIn } = useUser();

  // start fetching data from the api on initial render
  const { data } = api.rockets.getAll.useQuery();

  // return empty div if user is not loaded
  if (!userLoaded) return <div />

  return (
    <>
      <Head>
        <title>Sora Union</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className=" w-full md:max-w-2xl h-full border-x border-slate-400">
          <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && (<div className="flex justify-center">
              <SignInButton />
            </div>
            )}
            {!!isSignedIn && <CreateRocketWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
