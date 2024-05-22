import { useEffect, useState } from "react"
import { Helpers } from "../helpers"
import { IBooking, IQuota } from "../types";
import { Stack } from "@mui/material";
import { BookingList } from "../BookingList";
import { QuotaList } from "../QuotaList";
import { BookingCreateForm } from "../BookingCreateForm";

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
}

export function UserMakesBookingPage() {
    const [response, setResponse] = useState<MakeABookingResponse | null>(null);

    useEffect(() => {
        Helpers.get<any>('/api/makeABooking')
            .then((result: MakeABookingResponse) => {
                setResponse(result);
            })
    })

    return (
        <>{
            response != null
                ?
                <>
                    (response.status === BookingStatus.bookingInProgress ?
                    <>
                        <h2>
                            YOUR STATUS: Booked
                        </h2>
                        <p>
                            No need to book. You should already have access.
                            You have {response.timeRemainingOnCurrentBooking} mins 
                            remaining on your current booking.
                        </p>
                    </>
                    :
                    response.status === BookingStatus.cooldownRemaining ?
                    <>
                        <h2>
                            YOUR STATUS: Cooling down
                        </h2>
                        <p>
                            You will be able to start another booking
                            in ${response.cooldownRemainingMins} minutes.
                        </p>
                    </>
                    :
                    response.status === BookingStatus.needsToBook ?
                    <>
                        <h2>
                            YOUR STATUS: You need to book
                        </h2>
                        <p>
                            For more screen time, make a booking now. 
                            You can book up to {response.maxDurationOfNextBook} mins.
                        </p>
                        <BookingCreateForm onCreated={() => null} 
                            userId={response.userId} quota={response.todaysQuota} 
                            maxDurationOfNextBook={response.maxDurationOfNextBook} />
                    </>
                    :
                    response.status === BookingStatus.quotaExceeded ?
                    <>
                        <h2>
                            YOUR STATUS: Quota exceeded
                        </h2>
                        <p>
                            Please wait until tomorrow for more screen time.
                        </p>
                    </>
                    :
                    <p>
                        Status error
                    </p>
                    )
                    <Stack direction="column">
                        {response.inProgressBookings.length > 0 ? 
                        <>
                            <h2>Bookings in progress</h2>
                            <BookingList bookings={response.inProgressBookings} />
                            Total mins: {response.inProgressBookingsTotalTimeMins}
                        </>
                        : ""}

                        <h2>Completed bookings</h2>
                        <BookingList bookings={response.pastBookings} />
                        Total mins: {response.pastBookingsTotalTimeMins}
                        
                        <h2>Quotas</h2>
                        <QuotaList quotas={response.quotasIncludingRollovers} />
                        Total available mins: {response.totalQuotaTime} 
                    </Stack>
                </>

                :
                <p>
                    Response error
                </p>
        }
        </>
    )
}