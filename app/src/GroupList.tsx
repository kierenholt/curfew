import { useContext, useEffect, useState } from "react"
import { IconButton } from "@mui/joy";
import GroupIcon from '@mui/icons-material/Group';
import { IUserGroup } from "./types";
import { Helpers } from "./helpers";
import { Delete, Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { FilterIcon, QuotaIcon } from "./Icon";
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Stack, Tooltip } from "@mui/material";
import { UserList } from "./UserList";

export function UserGroupList() {
    const pageContext = useContext(PageContext);
    let [groups, setGroups] = useState<IUserGroup[]>([]);

    useEffect(() => {
        Helpers.get<IUserGroup[]>("/api/tree/userGroups")
            .then((groups: IUserGroup[]) => {
                setGroups(groups)
            })
    }, []);


    const deleteGroup = (id: number) => {
        Helpers.delete(`/api/userGroups/${id}`)
            .then((deleted: number) => {
                console.log("deleted: " + deleted);
                if (deleted > 0) {
                    setGroups(groups.filter(g => g.id !== id));
                }
            })
    }

    const hasUsers = (g: IUserGroup): boolean => {
        return g.users !== undefined && g.users.length > 0;
    }

    return (<Stack direction="column">
        {groups.map((g: IUserGroup) =>
            <Accordion color="neutral" >
                <AccordionSummary>
                    <GroupIcon />
                    {g.name}
                </AccordionSummary>
                <AccordionDetails>
                    {g.users && <UserList initialUsers={g.users} />}
                </AccordionDetails>
                <AccordionActions>
                    <IconButton aria-label="Quotas" size="sm" variant="plain" color="neutral"
                        onClick={() => {
                            pageContext.setParams({ groupId: g.id });
                            pageContext.setCurrentPage(CurrentPage.manageQuotas);
                        }}>
                        <QuotaIcon />
                    </IconButton>
                    <IconButton aria-label="Filters" size="sm" variant="plain" color="neutral"
                        onClick={() => {
                            pageContext.setParams({ groupId: g.id });
                            pageContext.setCurrentPage(CurrentPage.manageFilters);
                        }} >
                        <FilterIcon />
                    </IconButton >
                    <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                        onClick={() => {
                            pageContext.setParams({ groupId: g.id });
                            pageContext.setCurrentPage(CurrentPage.editGroup);
                        }}>
                        <Edit />
                    </IconButton>
                    <Tooltip title={hasUsers(g) ? "if you wish to delete this groups, delete the users first." : "click to delete this group"}>
                        <span>
                            <IconButton aria-label="Delete" size="sm" variant="plain" color="neutral"
                                onClick={() => deleteGroup(g.id)}
                                disabled={hasUsers(g)}>
                                <Delete />
                            </IconButton>
                        </span>
                    </Tooltip>
                </AccordionActions>
            </Accordion>)}
    </Stack>
    )
}