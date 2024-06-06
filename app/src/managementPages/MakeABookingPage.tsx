import { useContext, useEffect, useState } from "react"
import { Helpers } from "../helpers"
import { IBooking, IQuota } from "../types";
import { Stack } from "@mui/material";
import { BookingList } from "../BookingList";
import { QuotaList } from "../QuotaList";
import { BookingCreateForm } from "../BookingCreateForm";
import { UserContext } from "./DetectUser";
import { RequestListWrapper } from "../RequestListWrapper";

export enum BookingStatus {
    quotaExceeded,
    cooldownRemaining,
    bookingInProgress,
    needsToBook,
    none,
    userBanned,
    groupBanned
}

export interface MakeABookingResponse {
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
    const userContext = useContext(UserContext);
    const [response, setResponse] = useState<MakeABookingResponse>();

    useEffect(() => {
        if (userContext) {
            Helpers.get<MakeABookingResponse>(`/api/user/${userContext.user.id}/makeABooking`)
                .then((result: MakeABookingResponse) => {
                    setResponse(result);
                })
        }
    }, [userContext])

    return (
        response === undefined
            ?
            <></>
            :
            response.error.length > 0
                ?
                <p>{response.error}</p>
                :
                <>
                    {userContext?.device && <RequestListWrapper deviceId={userContext?.device.id} />}

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
                                        onCreated={() => window.location.reload()}
                                        userId={userContext == null ? 0 : userContext.user.id}
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
                                    response.status === BookingStatus.userBanned ?
                                        <>
                                            <h3>
                                                YOUR STATUS: User is banned
                                            </h3>
                                            <p>
                                                Talk to your parent about ways that you might redeem yourself.
                                            </p>
                                        </>
                                        :
                                            response.status === BookingStatus.groupBanned ?
                                                <>
                                                    <h3>
                                                        YOUR STATUS: Group is banned
                                                    </h3>
                                                    <p>
                                                        Now is a great time to discover your other passions.
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
                                <BookingList bookings={response.inProgressBookings} allowEdit={false} setBookings={() => { }} />
                                Total used mins: {response.inProgressBookingsTotalTimeMins}
                            </>
                            : ""}

                        <h2>Today's completed bookings</h2>
                        <BookingList bookings={response.pastBookings} allowEdit={false} setBookings={() => { }} />
                        Total used mins: {response.pastBookingsTotalTimeMins}

                        <h2>Today's quotas</h2>
                        <QuotaList quotas={response.quotasIncludingRollovers} allowEdit={false} />
                        Total available mins: {response.totalQuotaTime}
                    </Stack>

                </>
    )
}