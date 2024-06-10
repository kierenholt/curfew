import { useState, useEffect, createContext } from "react";
import { Helpers } from "../helpers"
import { IUser, IDevice, IUserGroup } from "../types";
import { PageContent } from "./PageContent";

interface DetectUserResponse {
    user: IUser;
    device: IDevice;
    group: IUserGroup;
}

export const UserContext = createContext<DetectUserResponse | null>(null);

export const DetectUser = () => {

    const [response, setResponse] = useState<DetectUserResponse | null>(null);

    useEffect(() => {
        Helpers.get<DetectUserResponse>(`/api/detectUser`)
            .then((response: DetectUserResponse) => {
                setResponse(response);
            })
    }, [])

    return (
        response === null
            ?
            <p>error connecting. please ensure curfew server is running.</p>
            :
            response.user === null || response.device === null
                ?
                <p>user not found. please disconnect then reconnect your wifi.</p>
                :
                <UserContext.Provider value={response}>
                    <PageContent />
                </UserContext.Provider>
    )
}