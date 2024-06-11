import {  useEffect, useState } from "react"
import { IUserGroup } from "./types";
import { Helpers } from "./helpers";
import { GroupListItem } from "./GroupListItem";
import { Stack } from "@mui/material";

export function UserGroupList() {
    let [groups, setGroups] = useState<IUserGroup[]>([]);

    useEffect(() => {
        Helpers.get<IUserGroup[]>(`/api/tree/userGroups`)
            .then((groups: IUserGroup[]) => {
                setGroups(groups)
            })
    }, []);


    return (
    <Stack direction="column">
        {groups.map((g: IUserGroup) => <GroupListItem group={g} /> )}
    </Stack>
    )
}