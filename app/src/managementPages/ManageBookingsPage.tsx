import { useEffect, useState } from "react";
import { BookingList } from "../BookingList";
import { Helpers } from "../helpers";
import { IBooking } from "../types";
  
export interface ManageBookingsPageProps {
    params: any //userId
}

export function ManageBookingsPage(props: ManageBookingsPageProps) {
    const [bookings, setBookings] = useState<IBooking[]>([]);

    useEffect(() => {
            Helpers.get<IBooking[]>(`/api/bookings`)
                .then((bookings: IBooking[]) => {
                    setBookings(bookings)
                })
    }, []);
    
    return (
        <>
            <p>
                Bookings
            </p>
                <BookingList bookings={bookings} 
                    setBookings={setBookings} 
                    allowEdit={true}/>
        </>
    )
}