import { Button } from "@mui/material"
import { RequestList } from "./RequestList"
import { useEffect, useState } from "react"
import { Helpers } from "./helpers"
import { IRequest, ISetting } from "./types"
import { GroupedRequestList } from "./GroupedRequestList"


export interface RequestListWrapperProps {
    deviceId: string
}

export const RequestListWrapper = (props: RequestListWrapperProps) => {

    const [requests, setRequests] = useState<IRequest[]>([]);
    const [offset, setOffset] = useState<number>(0);
    const [groupingEnabled, setGroupingEnabled] = useState<boolean>(false);

    useEffect(() => {
        getMoreRequests([])
            .then(r => waitForMoreRequests(r));

        Helpers.get<ISetting>(`/api/settings/2`)
            .then((result: ISetting) => {
                setGroupingEnabled(result.value === "true");
            });
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
        {
            groupingEnabled
                ?
                <GroupedRequestList requests={requests} />
                :
                <RequestList requests={requests} />
        }
        <Button onClick={() => getMoreRequests(requests)} >
            Show More
        </Button>
    </>
}