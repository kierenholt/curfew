import { FormControlLabel, Switch } from "@mui/material";
import { useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { IUser } from "./types";

export interface UserSetBanProps {
    userId: number;
}

export const UserSetBan = (props: UserSetBanProps) => {
    const [isBanned, setIsBanned] = useState(false);
    const [name, setName] = useState("");

    useEffect(() => {
        Helpers.get<IUser>(`/api/Users/${props.userId}`)
        .then((user: IUser) => {
            setIsBanned(user.isBanned);
            setName(user.name);
        })
    })

    const setUserBan = (value: boolean) => {
        Helpers.put<number>(`/api/Users/${props.userId}/isBanned=${value ? 1 : 0}`, {})
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
                        setUserBan(event.target.checked);
                    }
                }/>
        } label={name} />
    )
}