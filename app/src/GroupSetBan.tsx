import { FormControlLabel, Switch } from "@mui/material";
import { useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { IUserGroup } from "./types";

export interface GroupSetBanProps {
    groupId: number;
}

export const GroupSetBan = (props: GroupSetBanProps) => {
    const [isBanned, setIsBanned] = useState(false);
    const [name, setName] = useState("");

    useEffect(() => {
        Helpers.get<IUserGroup>(`/api/userGroups/${props.groupId}`)
        .then((group: IUserGroup) => {
            setIsBanned(group.isBanned);
            setName(group.name);
        })
    })

    const setGroupBan = (value: boolean) => {
        Helpers.put<number>(`/api/userGroups/${props.groupId}/isBanned=${value ? 1 : 0}`, {})
            .then((updated: number) => {
                if (updated > 0) {
                    setIsBanned(value);
                }
            })
    }

    return (
        <FormControlLabel control={
            <Switch 
                checked={isBanned}
                onChange={
                    (event: React.ChangeEvent<HTMLInputElement>) => {
                        setGroupBan(event.target.checked);
                    }
                }/>
        } label={name} />
    )
}