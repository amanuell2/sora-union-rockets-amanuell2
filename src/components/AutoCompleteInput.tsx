/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Fragment, useEffect, useState,useMemo } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import Image from 'next/image'
import debounce from 'lodash.debounce'

type User = {
    id: number
    name: string
    profileImageUrl: string
}

export const AutoCompleteInput = () => {
    const [query, setQuery] = useState<string>('')
    const [peoples, setPeoples] = useState<people[]>([])
    const [selected, setSelected] = useState(null)

    const handleChange = (e) => {
        console.log(e.target.value)
        setQuery(e.target.value) 
      }

    const debouncedResults = useMemo(() => {
        return debounce(handleChange, 300);
      }, []);


    useEffect(() => {
        if (query === '') {
            setPeoples([])
            return
        }
       void request<User[]>(`https://api.github.com/search/users?q=${query}`).then((data) => {
            const users:User[] = data.items.map((user) => ({
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
    }, [])

    return (
        <div className=" top-16 w-full">
            <Combobox value={selected} onChange={setSelected}>
                <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                        <Combobox.Input
                            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                            displayValue={(person) => person?.name}
                            onChange={debouncedResults}  
                        />
                    </div>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
               <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {peoples.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                peoples.map((person) => (
                  <Combobox.Option
                    key={person.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 px-2 ${
                        active ? 'bg-teal-600 text-white' : 'text-gray-900'
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
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {person?.name}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-teal-600'
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
        .then((data) => data as TResponse);

}