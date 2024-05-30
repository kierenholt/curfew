import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent } from "@mui/joy";
import { IBooking } from "./types";
import { BookingIcon } from "./Icon";

export interface BookingListProps {
    bookings: IBooking[];
} 

export function BookingList(props: BookingListProps) {

    return (<List>
        {props.bookings.map((g: IBooking) =>
            <ListItem color="neutral">
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