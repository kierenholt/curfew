import { useContext, useEffect, useState } from "react"
import { IconButton } from "@mui/joy";
import { IUserGroup } from "./types";
import { Helpers } from "./helpers";
import { Delete, Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { FilterIcon, QuotaIcon, UserGroupIcon } from "./Icon";
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Tooltip, Typography } from "@mui/material";
import { UserList } from "./UserList";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GroupBanToggleButton } from "./GroupBanToggleButton";

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

                <Box sx={{ display: "flex" }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel2a-header"
                        sx={{ flexGrow: 1 }}
                    >

                        <UserGroupIcon />
                        <Typography>
                            {g.name}
                        </Typography>
                    </AccordionSummary>
                    <Box>
                        <GroupBanToggleButton group={g} />
                        <IconButton aria-label="Quotas" size="sm" variant="plain" color="neutral"
                            onClick={() => {
                                pageContext.setParams({ groupId: g.id });
                                pageContext.goTo(CurrentPage.manageQuotas);
                            }}>
                            <QuotaIcon />
                        </IconButton>
                        <IconButton aria-label="Filters" size="sm" variant="plain" color="neutral"
                            onClick={() => {
                                pageContext.setParams({ groupId: g.id });
                                pageContext.goTo(CurrentPage.manageFilters);
                            }} >
                            <FilterIcon />
                        </IconButton >
                        <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                            onClick={() => {
                                pageContext.setParams({ groupId: g.id });
                                pageContext.goTo(CurrentPage.editGroup);
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

                    </Box>
                </Box>
                <AccordionDetails>
                    {g.users && <UserList initialUsers={g.users} />}
                </AccordionDetails>
            </Accordion>)}
    </Stack>
    )
}