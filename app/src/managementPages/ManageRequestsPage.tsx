import { useContext, useEffect, useState } from "react";
import { PageContext } from "./PageContent";
import { RequestList } from "../RequestList";
import { Helpers } from "../helpers";
import { DeviceSelect } from "../DeviceSelect";
import { IRequest } from "../types";

export interface ManageRequestsProps {
    params: any; //deviceId
}

export function ManageRequestsPage(props: ManageRequestsProps) {
    const pageContext = useContext(PageContext);
    const [deviceId, setDeviceId] = useState<string>(props.params?.deviceId ?? "");
    
    let [requests, setRequests] = useState<IRequest[]>([]);

    useEffect(() => {
        if (deviceId) {
            Helpers.get<IRequest[]>(`/api/requests/device/${deviceId}`)
                .then((requests: IRequest[]) => {
                    setRequests(requests);
                })
        }
    }, [deviceId]);

    return (
        <>
            <p>list of requests for device:</p>
            <DeviceSelect selectedDeviceId={deviceId} 
                setSelectedDeviceId={(id: string) => setDeviceId(id)} />
            <RequestList requests={requests} />
        </>
    )
}