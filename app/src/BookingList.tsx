import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent } from "@mui/joy";
import { IBooking } from "./types";
import HourglassTopIcon from '@mui/icons-material/HourglassTop';

export interface BookingListProps {
    bookings: IBooking[];
} 

export function BookingList(props: BookingListProps) {

    return (<List>
        {props.bookings.map((g: IBooking) =>
            <ListItem color="neutral">
                <ListItemButton>
                    <ListItemDecorator>
                        <HourglassTopIcon />
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