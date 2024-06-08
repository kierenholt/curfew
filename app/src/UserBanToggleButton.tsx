import { ToggleButton, Tooltip } from "@mui/material";
import { IUser } from "./types";
import { useState } from "react";
import { BanIcon } from "./Icon";
import { Helpers } from "./helpers";


interface UserBanToggleButtonProps {
    user: IUser;
}

export const UserBanToggleButton = (props: UserBanToggleButtonProps) => {
    const [isBanned, setIsBanned] = useState<boolean>(props.user.isBanned);

    const apply = (userId: number, value: boolean) => {
        Helpers.put<number>(`/api/users/${userId}/isBanned=${value ? 1 : 0}`, {})
            .then((updated: number) => {
                if (updated > 0) {
                    setIsBanned(value);
                }
            })
    }

    return (
        <Tooltip title={isBanned ? "click to unban" : "click to ban"}>
            <ToggleButton
                value="ban"
                selected={isBanned}
                onChange={() => {
                    apply(props.user.id, !isBanned);
                }}
            >
                <BanIcon />
            </ToggleButton>
        </Tooltip>
    )

}