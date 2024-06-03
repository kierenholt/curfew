import { useEffect, useState } from "react";
import { RequestList } from "../RequestList";
import { Helpers } from "../helpers";
import { DeviceSelect } from "../DeviceSelect";
import { IRequest } from "../types";
import { Button } from "@mui/material";

export interface ManageRequestsProps {
    params: any; //deviceId
}

export function ManageRequestsPage(props: ManageRequestsProps) {
    const [deviceId, setDeviceId] = useState<string>(props.params?.deviceId ?? "");
    const [offset, setOffset] = useState<number>(0);
    const [requests, setRequests] = useState<IRequest[]>([]);

    useEffect(() => {
        getMoreRequests();
    }, [deviceId]);

    const getMoreRequests = () => {
        if (deviceId) {
            Helpers.get<IRequest[]>(`/api/requests/device/${deviceId}?offset=${offset}`)
                .then((newRequests: IRequest[]) => {
                    setRequests(requests.concat(newRequests));
                    setOffset(offset + newRequests.length);
                });
        }
    }

    return (
        <>
            <p>list of requests for device:</p>
            <DeviceSelect selectedDeviceId={deviceId}
                setSelectedDeviceId={(id: string) => setDeviceId(id)} />
            <RequestList requests={requests} />
            <Button onClick={getMoreRequests}>
                Show More
            </Button>
        </>
    )
}