import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent } from "@mui/joy";
import { IRequest } from "./types";
import CloudIcon from '@mui/icons-material/Cloud';
import { AllowDenyIcon } from "./AllowDenyIcon";

export interface RequestListProps {
    requests: IRequest[];
}

export function RequestList(props: RequestListProps) {
    return (<List>
        {props.requests.map((g: IRequest) =>
            <ListItem color="neutral">
                <ListItemButton>
                    <ListItemDecorator>
                        <CloudIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                        {g.domain}
                        <AllowDenyIcon redirectDestination={g.redirectDestination} />
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}