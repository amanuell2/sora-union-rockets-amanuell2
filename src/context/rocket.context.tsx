import React from 'react';
import { type RouterOutputs } from '~/utils/api';

// extract the only rocket type from the api
type Rocket = RouterOutputs["rockets"]["getAll"][number];


type TRocketContext = {
    rocket: Rocket['rocket'] | null;
    updateRocket: (rocket: Rocket['rocket']) => void;
    isUpdating: boolean;
    setIsUpdating: (isUpdating: boolean) => void;
    authorId: string;
    setAuthor: (authorId: string) => void;
}

const RocketContext = React.createContext<TRocketContext | null>(null);

const Provider = RocketContext.Provider;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RocketContextProvider = ({ children }: any) => {

    const [isUpdating, setIsUpdating] = React.useState(false);
    const [rocket, setRocket] = React.useState<Rocket['rocket'] | null>(null);
    const [authorId, setAuthorId] = React.useState<string>('');


    const updateRocket = (_rocket: Rocket['rocket']) => {
        if(_rocket) {
            setRocket(_rocket)
            setIsUpdating(true)
       }
    }

    return (
        <Provider value={{
            rocket,
            updateRocket: (rocket: Rocket['rocket']) => updateRocket(rocket),
            isUpdating,
            setIsUpdating: (isUpdating: boolean) => setIsUpdating(isUpdating),
            authorId,
            setAuthor: (authorId: string) => setAuthorId(authorId)
        }}>
            {children}
        </Provider>
    )
}


// expose a hook to use the context 
const useRocket = () => {
    const context = React.useContext(RocketContext);
    if (!context) {
        throw new Error("useRocket must be used within a RocketContextProvider")
    }
    return context;
}


export { RocketContext, RocketContextProvider, useRocket }