/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Fragment, useEffect, useState, useMemo } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import Image from 'next/image'
import debounce from 'lodash.debounce'
import { useRocket } from '~/context/rocket.context'

export interface IGitUser {
  avatar_url: string
  login: string
  id: number
}

type User = {
  id: number
  name: string
  profileImageUrl: string
}

export const AutoCompleteInput = () => {
  const { setAuthor } = useRocket();
  const [query, setQuery] = useState<string>('')
  const [peoples, setPeoples] = useState<User[]>([])
  const [selected, setSelected] = useState(null)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const debouncedResults = useMemo(() => {
    return debounce(handleChange, 300);
  }, []);

const onchange = (value: User) => {
  console.log(value)
    setSelected(value)
    setAuthor(value?.id)
}
  useEffect(() => {
    if (query === '') {
      setPeoples([])
      return
    }
    void request<IGitUser[]>(`https://api.github.com/search/users?q=${query}`).then((data) => {
    const users: User[] = data.map((user) => ({
        id: user.id,
        name: user.login,
        profileImageUrl: user.avatar_url,
      }))
      setPeoples(users)
    })

  }, [query])

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="top-16 w-full border rounded-md">
      <Combobox value={selected} onChange={onchange}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left focus:outline-none  sm:text-sm">
            <Combobox.Input
              className="w-full placeholder-slate-400 border-none py-3.5 px-4  text-sm leading-5 text-gray-900 focus:outline-none"
              displayValue={(person:User) => person?.name || ''}
              onChange={debouncedResults}
              placeholder='Github User '
            />
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {peoples.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-slate-700">
                  Nothing found.
                </div>
              ) : (
                peoples.map((person) => (
                  <Combobox.Option
                    key={person.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 px-2 ${active ? 'bg-slate-500 text-white' : 'text-gray-900'
                      }`
                    }
                    value={person}
                  >
                    {({ selected, active }) => (
                      <div className="flex items-center justify-start gap-3">
                        <Image src={person?.profileImageUrl} alt="profile image"
                          className="w-14 h-14 rounded-full"
                          width={32}
                          height={32}
                        />
                        <span
                          className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                            }`}
                        >
                          {person?.name}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-slate-600'
                              }`}
                          >

                          </span>
                        ) : null}
                      </div>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  )
}

function request<TResponse>(
  url: string,
  config: RequestInit = {}

): Promise<TResponse> {

  return fetch(url, config)
    .then((response) => response.json())
    // and return the result data.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .then((data) => data?.items as TResponse);

}