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
import React, { useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { z } from "zod";
import { type SubmitHandler, useForm, } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RocketContextProvider, useRocket } from "~/context/rocket.context";
import { AutoCompleteInput } from "~/components/AutoCompleteInput";

dayjs.extend(relativeTime);
type RocketWithUser = RouterOutputs["rockets"]["getAll"][number];



const CreateRocketWizard = () => {
  const { isUpdating, rocket, setIsUpdating } = useRocket();

  const formSchema = z.object({
    title: z.string().min(3).max(50),
    description: z.string().min(3).max(500),
  })

  type RocketFormType = z.infer<typeof formSchema>;

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<RocketFormType>({
    resolver: zodResolver(formSchema)
  })

  const onSubmit: SubmitHandler<RocketFormType> = (data, e) => {
    e?.preventDefault()
    if (isUpdating && rocket?.id) {
    void  updateMutate({ id: rocket?.id, ...data })
      return
    }
  void  mutate(data)
  }

  useEffect(() => {
    if (isUpdating && rocket) {
      setValue("title", rocket?.title, { shouldValidate: true })
      setValue("description", rocket?.description, { shouldValidate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdating, rocket])

  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isRocketing } = api.rockets.create.useMutation({
    onSuccess: () => {
      reset()
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


  const { mutate: updateMutate, isLoading: isReviewUpdating } = api.rockets.update.useMutation({
    onSuccess: () => {
      reset()
      setIsUpdating(false)
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
      <form onSubmit={void handleSubmit(onSubmit)} className="flex flex-row w-full" >
        <div className="flex flex-col w-full gap-3">
          <input type="text" placeholder="rocket title" className="bg-transparent grow outline-none"
            disabled={isRocketing}
            {...register("title")}
          />
          {errors.title && (
            <span className="text-red-800 block mt-2">
              {errors.title?.message}
            </span>
          )}
          <input type="text" placeholder="rocket description" className="bg-transparent grow outline-none border w-9/12 border-rose-100 px-2"
            {...register("description")}
          />
          {errors.description && (
            <span className="text-red-800 block mt-2">
              {errors.description?.message}
            </span>
          )}
        <div className="border-rose-100 w-9/12">
        <AutoCompleteInput/>
        </div>
        </div>
        {
          !isSubmitting && !isRocketing && !isReviewUpdating && (
            <button className="bg-rose-100 text-rose-500 self-center w-32 h-1/2 rounded-full"
              type="submit"
            >
              {isUpdating ? "Update" : "Create"}
            </button>
          )}
        {
          isRocketing || isReviewUpdating && (
            <div className="flex items-center justify-center">
              <LoadingSpinner size={40} />
            </div>
          )}
      </form>
    </div>
  )
}

const RocketView = (props: RocketWithUser) => {
  const { rocket, author } = props;
  const ctx = api.useContext();
  const { updateRocket } = useRocket();

  const { mutate: deleteMutate } = api.rockets.delete.useMutation({
    onSuccess: () => {
      toast.success("Deleted successfully")
      void ctx.rockets.getAll.invalidate()
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors;
      if (errorMessage) toast.error("Something went wrong")
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
          onClick={() => updateRocket(rocket)}
        >
          <FaEdit />
        </button>
        <button className="text-rose-100 p-2"
          onClick={() => deleteMutate({ id: rocket.id })}
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

const Home: NextPage = (_props) => {

  // get user data from the useUser hook provided by next clerk
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();

  // start fetching data from the api on initial render react query will cache the data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        <RocketContextProvider>
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
        </RocketContextProvider>
      </main>
    </>
  );
};

export default Home;
