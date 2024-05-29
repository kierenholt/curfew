import { Accordion } from "@mui/material";
import { IRequest, RedirectDestination, RedirectReason } from "./types";
import CloudIcon from '@mui/icons-material/Cloud';
import { AllowDenyIcon } from "./AllowDenyIcon";
import { AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DateFormatter } from "./DateFormatter";

export interface RequestListProps {
    requests: IRequest[];
}

export function RequestList(props: RequestListProps) {
    const details = (r: IRequest): string => {
        switch (r.redirectReason) {
            case RedirectReason.deviceIsBanned:
                return "the device is banned";
            case RedirectReason.userIsBanned:
                return "the user is banned";
            case RedirectReason.groupIsBanned:
                return "the group is banned";
            case RedirectReason.domainIsAlwaysAllowed:
                return "the domain is always allowed";
            case RedirectReason.domainIsAlwaysBlocked:
                return "the domain is always blocked";
            case RedirectReason.filterNotFound:
                return "no filter action is chosen for this domain";
            case RedirectReason.hasBooked:
                return "a slot is booked";
            case RedirectReason.needsToBook:
                return "a slot needs to be booked";
            case RedirectReason.error:
                return "an error occured";
            default:
                return ""
        }
    }

    const action = (r: IRequest): string => {
        switch (r.redirectDestination) {
            case RedirectDestination.allow:
                return "Allowed";
            case RedirectDestination.blocked:
                return "Blocked";
            default:
                return ""
        }
    }

    return (
        <>
            {props.requests.map((g: IRequest, i: number) =>
                <Accordion color="neutral">
                    <AccordionSummary style={{ alignItems: "center" }}
                        expandIcon={<ExpandMoreIcon />}>

                        <CloudIcon />
                        {g.domain}
                        <AllowDenyIcon redirectDestination={g.redirectDestination} />
                        {DateFormatter.agoFormat(g.requestedOn)}
                    </AccordionSummary>
                    <AccordionDetails>
                        {action(g)} because {details(g)}
                    </AccordionDetails>
                </Accordion>)}
        </>
    )
}