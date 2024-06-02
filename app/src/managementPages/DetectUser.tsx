import { useState, useEffect, createContext } from "react";
import { Helpers } from "../helpers"
import { IUser, IDevice } from "../types";
import { PageContent } from "./PageContent";

interface DetectUserResponse {
    user: IUser;
    device: IDevice;
}

export const UserContext = createContext<DetectUserResponse| null>(null);

export const DetectUser = () => {
    
    const [detectUserResponse, setDetectUserResponse] = useState<DetectUserResponse | null>(null);

    useEffect(() => {
        Helpers.get<DetectUserResponse>(`/api/detectUser`)
        .then((response: DetectUserResponse) => {
            
            setDetectUserResponse(response);
        })
    }, [])
    
    return (
        <UserContext.Provider value={detectUserResponse}>
            <PageContent />
        </UserContext.Provider>
    )
}