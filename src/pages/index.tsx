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
import { FaTrash, FaPencilAlt } from "react-icons/fa";
import { z } from "zod";
import { type SubmitHandler, useForm, } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RocketContextProvider, useRocket } from "~/context/rocket.context";
import { AutoCompleteInput } from "~/components/AutoCompleteInput";

dayjs.extend(relativeTime);
type RocketWithUser = RouterOutputs["rockets"]["getAll"][number];



const CreateRocketWizard = () => {
  const { isUpdating, rocket, setIsUpdating, gitUser, setGitUser } = useRocket();

  const formSchema = z.object({
    title: z.string().min(3).max(50),
    description: z.string().min(3).max(500),
    rocketName: z.string().min(3).max(50),
    // gitUsername: z.string().min(3).max(50),
    // gitUserAvatar: z.string().min(3).max(50),
  })

  type RocketFormType = z.infer<typeof formSchema>;

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<RocketFormType>({
    resolver: zodResolver(formSchema)
  })
  const onError = (errors: any, e: any) => console.log(errors, e);
  const onSubmit: SubmitHandler<RocketFormType> = (data) => {
    if (isUpdating && rocket?.id) {
      updateMutate({ id: rocket?.id, ...data, gitUsername: gitUser?.gitUsername, gitUserAvatar: gitUser?.gitUserAvatar })
      return
    }
    mutate({ ...data, gitUsername: gitUser?.gitUsername, gitUserAvatar: gitUser?.gitUserAvatar })
  }

  useEffect(() => {
    if (isUpdating && rocket) {
      setValue("title", rocket?.title, { shouldValidate: true })
      setValue("description", rocket?.description, { shouldValidate: true })
      setValue("rocketName", rocket?.rocketName, { shouldValidate: true })
      setGitUser({ gitUsername: rocket?.gitUsername, gitUserAvatar: rocket?.gitUserAvatar })

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
    <div className="flex flex-col gap-3 px-6 sm:h-screen w-full mb-12 place-content-center">
      <Image src={user.profileImageUrl} alt="profile image"
        className="w-14 h-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="relative w-full flex flex-col xl:flex-row  xl:h-2/3 sm:h-2/3 self-center pr-8 sm:pr-0 pl-8 sm:pl-0å">
        <div className="absolute -right-1 top-24 xl:top-0 mt-2 hidden tablet:block">
          <Image src="/dot-shape.png" alt="dot shape image" width={160} height={700} className="h-48 object-fit" />
        </div>
        <div className="absolute -right-2 -top-20 xl:top-0 hidden tablet:block">
          <Image src="/Oval.png" alt="dot shape image" width={160} height={700} className="h-48 object-fit" />
        </div>
        <form onSubmit={handleSubmit(onSubmit, onError)} className=" flex flex-col bg-white container-shadow self-center px-8 sm:px-16 py-8 xl:py-0 xl:w-3/4 justify-center rounded-lg w-full" >
          <div className="flex flex-col gap-8 w-full xl:w-9/12 self-center">
            <div className="w-full flex flex-col">
              <input type="text" placeholder="Enter Title" className="bg-white border border-gray-100 text-gray-900 text-sm rounded-md p-3.5 placeholder-slate-400" disabled={isRocketing} {...register("title")} />
              {errors.title && (
                <span className="text-red-800 block font-thin">
                  {errors.title?.message}
                </span>
              )}
            </div>
            <div className="w-full flex flex-col">
              <input type="text" placeholder="Enter Rocket Name" className="border border-gray-100 text-gray-900 text-sm rounded-lg p-3.5 placeholder-slate-400" disabled={isRocketing} {...register("rocketName")} />
              {errors.title && (
                <span className="text-black font-thin">
                  {errors.title?.message}
                </span>
              )}
            </div>
            <div className="w-full flex flex-col">
              <textarea rows={5} placeholder="Enter Description" className="border border-gray-100 text-gray-900 text-sm rounded-lg p-2.5 placeholder-slate-400" {...register("description")} />
              {errors.description && (
                <span className="text-red-800 font-thin">
                  {errors.description?.message}
                </span>
              )}
            </div>
            <div className="mb-4">
              <AutoCompleteInput />
            </div>
          </div>
          {!isSubmitting && !isRocketing && !isReviewUpdating && (
            <button className="text-white self-center w-full xl:w-9/12 h-16 rounded-md btn mt-8" type="submit">
              {isUpdating ? "Update Review" : "Add Review"}
            </button>
          )}
          { (isReviewUpdating || isRocketing) && (
            <div className="flex items-center justify-center mt-8">
              <LoadingSpinner size={40} />
            </div>
          )}
        </form>
        <div className="absolute -left-2  -bottom-8 hidden tablet:block">
          <Image src="/dot-shape.png" alt="dot shape image" width={160} height={700} className="h-48 object-fit" />
        </div>
      </div>
    </div>
  )
}

const RocketView = (props: RocketWithUser) => {
  const { user } = useUser();
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
    <div className="bg-white p-4 flex justify-between items-center lg:flex-col sm:flex-row gap-2 container-shadow rounded-2xl" key={rocket.id}>
      <div className=" w-2/6 flex items-center justify-center">
        <iframe src="https://embed.lottiefiles.com/animation/53863"></iframe>
      </div>
      <div className="w-full flex flex-col justify-between grow-1">
        <div className="flex flex-row justify-end items-center gap-4">
          <button className="text-blue-400 p-3 bg-slate-200 rounded-md cursor-pointer disabled:cursor-auto disabled:opacity-20"
            onClick={() => updateRocket(rocket)}
            disabled={user?.id !== rocket.authorId}
          >
            <FaPencilAlt size={20} />
          </button>
          <button className="text-red-300 p-3 bg-rose-400 rounded-md cursor-pointer disabled:cursor-auto disabled:opacity-20"
            onClick={() => deleteMutate({ id: rocket.id })}
            disabled={user?.id !== rocket.authorId}
          >
            <FaTrash size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-2 pl-8">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-black">{rocket.title}</span>
            <span className="text-xl font-bold text-black">{rocket.rocketName}</span>
            <span className=" text-base text-gray-400">{rocket.description}</span>
          </div>
          <div className="flex justify-start items-center gap-4">
            <Image
              width={48}
              height={48}
              className="w-12 h-12 rounded-full "
              src={rocket.gitUserAvatar} alt="profile image" />
            <div className="">
              <span className="text-gray-600 ">{`@${rocket.gitUsername}`}</span>
              <span className="text-gray-500 row-span-2">{` · ${dayjs(rocket.createdAt).fromNow()}`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  )

}

const Feed = () => {
  const { data, isLoading: rocketLoading } = api.rockets.getAll.useQuery();

  if (rocketLoading) return <Loading />

  if (!data) return <div className="h-full w-full items-center justify-center">
    <h4 className="text-slate-400">Something goes wrong!</h4>
    <iframe src="https://embed.lottiefiles.com/animation/23520"></iframe>
  </div>

  return (
    <div className="w-full h-full flex flex-col px-8 gap-9">
      <Image src="/logo.png" alt="profile image"
        className="w-14 h-14"
        width={56}
        height={56}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAA"
      />
      <div className="py-4">
        <h1 className="text-4xl font-bold text-black">List of Rockets</h1>
      </div>
      <div className="max-h-full flex flex-col gap-4">
        {data.map((rocketDetail) => (
          <RocketView {...rocketDetail} key={rocketDetail.rocket.id} />
        ))}
        {data.length === 0 &&
          <>
            <h4 className="text-slate-400 text-center">No rockets found!</h4>
           <div className="w-full h-96 flex justify-center items-center">
           <iframe src="https://embed.lottiefiles.com/animation/23520"></iframe>
           </div>
          </>
          }
      </div>
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
      <main className="flex justify-center h-screen py-12">
        <RocketContextProvider>
          <div className="w-full grid mobile:grid-cols-1 tablet:grid-cols-2 gap-4">
            <Feed />
            <div className="flex w-full h-screen justify-center items-center">
              {!isSignedIn && (
                <div className="flex flex-col">
                  <p className="text-slate-400 font-bold text-2xl">Authenticate and Leave Your Review </p>
                  <div className="flex text-black w-full h-64 justify-center items-center">
                    <SignInButton>
                      <button className="text-white  w-full h-16 rounded-md btn"
                        type="submit"
                      >
                        Sign in with Github
                      </button>
                    </SignInButton>
                  </div>
                </div>
              )}
              {!!isSignedIn && <CreateRocketWizard />}
            </div>

          </div>
        </RocketContextProvider>
      </main>
    </>
  );
};

export default Home;
