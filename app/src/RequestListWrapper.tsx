import { Button } from "@mui/material"
import { RequestList } from "./RequestList"
import { useEffect, useState } from "react"
import { Helpers } from "./helpers"
import { IRequest } from "./types"


export interface RequestListWrapperProps {
    deviceId: string
}

export const RequestListWrapper = (props: RequestListWrapperProps) => {

    const [requests, setRequests] = useState<IRequest[]>([]);
    const [offset, setOffset] = useState<number>(0);

    useEffect(() => {
        getMoreRequests(requests)
            .then(r => waitForMoreRequests(r))
    }, [props.deviceId])

    const waitForMoreRequests = (current: IRequest[]) => {
        Helpers.get<IRequest>(`/api/live/requests/device/${props.deviceId}`)
            .then((newRequest: IRequest) => {
                let newTotal = [newRequest, ...current]
                setRequests(newTotal);
                setOffset(offset + 1);
                waitForMoreRequests(newTotal);
            });
    }

    const getMoreRequests = (current: IRequest[]): Promise<IRequest[]> => {
        return Helpers.get<IRequest[]>(`/api/requests/device/${props.deviceId}?offset=${offset}`)
            .then((newRequests: IRequest[]) => {
                let newTotal = [...current, ...newRequests];
                setRequests(newTotal);
                setOffset(offset + newRequests.length);
                return newTotal;
            });
    }

    return <>
        <h2>Requests</h2>
        <RequestList requests={requests} />
        <Button onClick={() => getMoreRequests(requests)} >
            Show More
        </Button>
    </>
}