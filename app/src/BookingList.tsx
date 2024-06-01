import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import { IBooking } from "./types";
import { BookingIcon } from "./Icon";
import { Helpers } from "./helpers";
import { Delete } from "@mui/icons-material";

export interface BookingListProps {
    bookings: IBooking[];
    setBookings: (b: IBooking[]) => void;
    allowEdit: boolean;
}

export function BookingList(props: BookingListProps) {


    const deleteBooking = (id: number) => {
        Helpers.delete(`/api/bookings/${id}`)
            .then((deleted: number) => {
                console.log("deleted: " + deleted);
                if (deleted > 0) {
                    props.setBookings(props.bookings.filter(g => g.id !== id));
                }
            })
    }

    return (<List>
        {props.bookings.map((g: IBooking) =>
            <ListItem color="neutral"

                endAction={props.allowEdit &&
                    <>
                        <IconButton aria-label="Delete" size="sm" variant="plain" color="neutral"
                            onClick={() => deleteBooking(g.id)}>
                            <Delete />
                        </IconButton>
                    </>
                }>
                <ListItemButton>
                    <ListItemDecorator>
                        <BookingIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                        {new Date(g.startsOn).toLocaleString()},
                        {g.duration} mins
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}