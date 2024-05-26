import { useEffect, useState } from "react"
import { Helpers } from "../helpers"
import { IRequest } from "../types";
import { RequestList } from "../RequestList";


export const RequestHistoryPage = () => {
    const [requests, setRequests] = useState<IRequest[]>([]);
    
    useEffect(() => {
        Helpers.get<IRequest[]>('/api/requestHistory')
            .then((requests: IRequest[]) => {
                setRequests(requests);
            })
    }, [])

    return (
        <>
            <p>request history</p>
            <RequestList requests={requests} />
        </>
    )
}