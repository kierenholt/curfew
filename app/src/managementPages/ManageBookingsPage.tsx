import { useEffect, useState } from "react";
import { UserSelect } from "../UserSelect";
import { BookingList } from "../BookingList";
import { Helpers } from "../helpers";
import { IBooking } from "../types";

export interface ManageBookingsPageProps {
    params: any //userId
}

export function ManageBookingsPage(props: ManageBookingsPageProps) {
    const [userId, setUserId] = useState<number>(props.params ? props.params.userId : 0);
    const [bookings, setBookings] = useState<IBooking[]>([]);

    useEffect(() => {
        if (userId > 0) {
            Helpers.get<IBooking[]>(`/api/bookings/userId/${userId}`)
                .then((bookings: IBooking[]) => {
                    setBookings(bookings)
                })
        }
    }, [userId]);
    
    return (
        <>
            <p>
                bookings for user: 
                <UserSelect setSelectedUserId={setUserId} selectedUserId={userId} />
            </p>
            { userId === 0 ? 
                <p>please select a user first</p>
            :
                <BookingList bookings={bookings} />
            }
        </>
    )
}