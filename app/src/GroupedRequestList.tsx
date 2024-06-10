import { Accordion, AccordionActions, Button, List, ListItem } from "@mui/material";
import { IDevice, IFilter, IRequest, IUser } from "./types";
import { AllowDenyIcon } from "./AllowDenyIcon";
import { AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DateFormatter } from "./DateFormatter";
import { RequestIcon } from "./Icon";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { useContext } from "react";
import { Helpers } from "./helpers";
import { RedirectReasonIcon } from "./RedirectReasonIcon";

export interface GroupedRequestListProps {
    requests: IRequest[];
}

export interface RequestGroup {
    domain: string;
    items: IRequest[];
}

export function GroupedRequestList(props: GroupedRequestListProps) {
    const pageContext = useContext(PageContext);

    let requestGroups: RequestGroup[] = Helpers.distinct(props.requests.map(r => r.domain))
        .map(n => { return { domain: n, items: [] } });

    for (let request of props.requests) {
        let foundGroup = requestGroups.find(g => g.domain === request.domain);
        if (foundGroup) {
            foundGroup.items.push(request)
        }
    }

    const goToCreateFilterPage = (r: IRequest) => {
        Helpers.get<IDevice>(`/api/devices/${r.deviceId}`)
            .then((d: IDevice) => Helpers.get<IUser>(`/api/users/${d.ownerId}`))
            .then(async (u: IUser) => {
                let spl = r.domain.split(".");
                let index = Math.max(spl.length - 2, 0)
                let component = spl[index];
                let found = await Helpers.get<IFilter>(`/api/filters/component/${component}/group/${u.groupId}`)
                if (found) { //edit
                    pageContext.setParams({ id: found.id })
                    pageContext.goTo(CurrentPage.editFilter);
                }
                else { //create
                    pageContext.setParams({ component: component, groupId: u.groupId })
                    pageContext.goTo(CurrentPage.createFilter);
                }
            })
    }

    return (
        <>
            {requestGroups.map((g: RequestGroup, i: number) =>

                <Accordion color="neutral">
                    <AccordionSummary style={{ alignItems: "center" }}
                        expandIcon={<ExpandMoreIcon />}>

                        <RequestIcon />
                        {g.domain} ( {g.items.length} )

                    </AccordionSummary>
                    <AccordionDetails>

                        <List dense={true}>
                            {g.items.map(r =>
                                <ListItem>
                                    <RedirectReasonIcon reason={r.redirectReason} />
                                    <AllowDenyIcon redirectDestination={r.redirectDestination} />
                                    {DateFormatter.ago(r.requestedOn)}
                                </ListItem>
                            )}
                        </List>
                    </AccordionDetails>
                    <AccordionActions>
                        <Button onClick={() => goToCreateFilterPage(g.items[0])}>
                            Create Filter
                        </Button>
                    </AccordionActions>
                </Accordion>
            )}
        </>
    )
}