import { Accordion, AccordionActions, Button } from "@mui/material";
import { IDevice, IFilter, IRequest, IUser, RedirectDestination, RedirectReason } from "./types";
import { AllowDenyIcon } from "./AllowDenyIcon";
import { AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DateFormatter } from "./DateFormatter";
import { RequestIcon } from "./Icon";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { useContext } from "react";
import { Helpers } from "./helpers";

export interface RequestListProps {
    requests: IRequest[];
}

export function RequestList(props: RequestListProps) {
    const pageContext = useContext(PageContext);
    
    const details = (r: IRequest): string => {
        switch (r.redirectReason) {
            case RedirectReason.deviceIsBanned:
                return "the device is banned";
            case RedirectReason.userIsBanned:
                return "the user is banned";
            case RedirectReason.groupIsBanned:
                return "the group is banned";
            case RedirectReason.domainIsAlwaysAllowed:
                return "the domain is allowed by a filter";
            case RedirectReason.domainIsAlwaysBlocked:
                return "the domain is blocked by a filter";
            case RedirectReason.filterNotFound:
                return "no filter matches the domain";
            case RedirectReason.hasBooked:
                return "the domain requires a slot, which is booked";
            case RedirectReason.needsToBook:
                return "the domain requires a slot but no slot is booked";
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

    const goToCreateFilterPage = (r: IRequest) => {
        Helpers.get<IDevice>(`/api/devices/${r.deviceId}`)
            .then((d: IDevice) => Helpers.get<IUser>(`/api/users/${d.ownerId}`))
            .then(async (u: IUser) => {
                let spl = r.domain.split(".");
                let index = Math.max(spl.length - 2,0)
                let component = spl[index];
                let found = await Helpers.get<IFilter>(`/api/filters/component/${component}/group/${u.groupId}`)
                if (found) { //edit
                    pageContext.setParams({component: found.component, groupId: found.groupId})
                    pageContext.setCurrentPage(CurrentPage.editFilter);
                }
                else { //create
                    pageContext.setParams({component: component, groupId: u.groupId})
                    pageContext.setCurrentPage(CurrentPage.createFilter);
                }
            })
    }

    return (
        <>
            {props.requests.map((r: IRequest, i: number) =>
                <Accordion color="neutral">
                    <AccordionSummary style={{ alignItems: "center" }}
                        expandIcon={<ExpandMoreIcon />}>

                        <RequestIcon />
                        {r.domain}
                        <AllowDenyIcon redirectDestination={r.redirectDestination} />
                        {DateFormatter.agoFormat(r.requestedOn)}
                    </AccordionSummary>
                    <AccordionDetails>
                        {action(r)} because {details(r)}
                    </AccordionDetails>
                    <AccordionActions>
                        <Button onClick={() => goToCreateFilterPage(r)}>
                            Create Filter
                        </Button>
                    </AccordionActions>
                </Accordion>)}
        </>
    )
}