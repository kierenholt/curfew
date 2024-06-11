import { Edit, Delete } from "@mui/icons-material";
import { Accordion, Box, AccordionSummary, Typography, AccordionDetails } from "@mui/material";
import { GroupBanToggleButton } from "./GroupBanToggleButton";
import { UserGroupIcon, QuotaIcon, FilterIcon, UndeleteIcon } from "./Icon";
import { UserList } from "./UserList";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { IUserGroup } from "./types";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useContext, useState } from "react";
import { Helpers } from "./helpers";
import { IconButton } from "@mui/joy";


interface GroupListItemProps {
    group: IUserGroup;
}

export const GroupListItem = (props: GroupListItemProps) => {
    const pageContext = useContext(PageContext);
    const [isDeleted, setIsDeleted] = useState<boolean>(props.group.isDeleted);

    const setDeleted = (g: IUserGroup, value: boolean) => {
        Helpers.put<number>(`/api/userGroups/${g.id}/isDeleted=${value ? 1 : 0}`, {})
            .then((updated: number) => {
                if (updated > 0) {
                    setIsDeleted(value);
                }
            })
    }

    return (

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
                    {props.group.name} {isDeleted ? "(deleted)" : ""}
                </Typography>
            </AccordionSummary>
            <Box>
                <GroupBanToggleButton group={props.group} />
                <IconButton aria-label="Quotas" size="sm" variant="plain" color="neutral"
                    onClick={() => {
                        pageContext.setParams({ groupId: props.group.id });
                        pageContext.goTo(CurrentPage.manageQuotas);
                    }}>
                    <QuotaIcon />
                </IconButton>
                <IconButton aria-label="Filters" size="sm" variant="plain" color="neutral"
                    onClick={() => {
                        pageContext.setParams({ groupId: props.group.id });
                        pageContext.goTo(CurrentPage.manageFilters);
                    }} >
                    <FilterIcon />
                </IconButton >
                <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                    onClick={() => {
                        pageContext.setParams({ groupId: props.group.id });
                        pageContext.goTo(CurrentPage.editGroup);
                    }}>
                    <Edit />
                </IconButton>
                {
                    isDeleted
                        ?
                        <IconButton aria-label="Undelete" size="sm" variant="plain" color="neutral"
                            onClick={() => setDeleted(props.group, false)}>
                            <UndeleteIcon />
                        </IconButton>
                        :
                        <IconButton aria-label="Delete" size="sm" variant="plain" color="neutral"
                            onClick={() => setDeleted(props.group, true)}>
                            <Delete />
                        </IconButton>
                }

            </Box>
        </Box>
        <AccordionDetails>
            {props.group.users && <UserList initialUsers={props.group.users} />}
        </AccordionDetails>
    </Accordion>
    )
}