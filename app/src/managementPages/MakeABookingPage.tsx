import { useContext, useEffect, useState } from "react"
import { Helpers } from "../helpers"
import { IBooking, IQuota, IRequest } from "../types";
import { Stack } from "@mui/material";
import { BookingList } from "../BookingList";
import { QuotaList } from "../QuotaList";
import { BookingCreateForm } from "../BookingCreateForm";
import { RequestList } from "../RequestList";
import { CurrentPage, PageContext } from "./PageContent";

export enum BookingStatus {
    quotaExceeded,
    cooldownRemaining,
    bookingInProgress,
    needsToBook,
    none
}

export interface MakeABookingResponse {
    userId: number;
    todaysQuota: IQuota;
    totalQuotaTime: number;
    quotasIncludingRollovers: IQuota[];
    pastBookings: IBooking[];
    inProgressBookings: IBooking[];
    pastBookingsTotalTimeMins: number;
    inProgressBookingsTotalTimeMins: number;
    cooldownRemainingMins: number;
    maxDurationOfNextBook: number;
    timeRemainingOnCurrentBooking: number;
    status: BookingStatus;
    error: string;
}

export function MakeABookingPage() {
    const pageContext = useContext(PageContext);
    const [response, setResponse] = useState<MakeABookingResponse>();
    const [requests, setRequests] = useState<IRequest[]>([]);
    
    useEffect(() => {
        Helpers.get<IRequest[]>('/api/requestHistory')
            .then((requests: IRequest[]) => {
                setRequests(requests);
            })

            Helpers.get<MakeABookingResponse>('/api/makeABooking')
            .then((result: MakeABookingResponse) => {
                setResponse(result);
            })
    }, [])

    return (
        response === undefined
            ?
            <p>an error has occurred</p>
            :
            response.error.length
                ?
                <p>{response.error}</p>
                :
                <>

                    <h2>Your requests</h2>
                    <RequestList requests={requests} />
            
                    {response.status === BookingStatus.bookingInProgress ?
                        <>
                            <h3>
                                YOUR STATUS: You have an open booking
                            </h3>
                            <p>
                                You should already have access with {response.timeRemainingOnCurrentBooking} mins
                                remaining on your current booking.
                            </p>
                        </>
                        :
                        response.status === BookingStatus.cooldownRemaining ?
                            <>
                                <h3>
                                    YOUR STATUS: Cooling down
                                </h3>
                                <p>
                                    You will be able to start another booking
                                    in {response.cooldownRemainingMins} minutes.
                                </p>
                            </>
                            :
                            response.status === BookingStatus.needsToBook ?
                                <>
                                    <h3>
                                        YOUR STATUS: If you want unrestricted screen time, you will need to book.
                                    </h3>
                                    <p>
                                        You can book up to {response.maxDurationOfNextBook} mins.
                                    </p>
                                    <BookingCreateForm 
                                        onCreated={() => pageContext.setCurrentPage(CurrentPage.userMakesBooking)}
                                        userId={response.userId} 
                                        quota={response.todaysQuota}
                                        maxDurationOfNextBook={response.maxDurationOfNextBook} />
                                </>
                                :
                                response.status === BookingStatus.quotaExceeded ?
                                    <>
                                        <h3>
                                            YOUR STATUS: Quota exceeded
                                        </h3>
                                        <p>
                                            Please wait until tomorrow for more screen time.
                                        </p>
                                    </>
                                    :
                                    <p>
                                        Status error
                                    </p>
                    }
                    
                    <Stack direction="column">
                        {response.inProgressBookings.length > 0 ?
                            <>
                                <h2>Bookings in progress</h2>
                                <BookingList bookings={response.inProgressBookings} />
                                Total used mins: {response.inProgressBookingsTotalTimeMins}
                            </>
                            : ""}

                        <h2>Today's completed bookings</h2>
                        <BookingList bookings={response.pastBookings} />
                        Total used mins: {response.pastBookingsTotalTimeMins}

                        <h2>Today's quotas</h2>
                        <QuotaList quotas={response.quotasIncludingRollovers} allowEdit={false}/>
                        Total available mins: {response.totalQuotaTime}
                    </Stack>

                    </>
    )
}