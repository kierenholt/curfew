import { ToggleButton, Tooltip } from "@mui/material";
import { IUserGroup } from "./types";
import { useState } from "react";
import { BanIcon } from "./Icon";
import { Helpers } from "./helpers";


interface GroupBanToggleButtonProps {
    group: IUserGroup;
}

export const GroupBanToggleButton = (props: GroupBanToggleButtonProps) => {
    const [isBanned, setIsBanned] = useState<boolean>(props.group.isBanned);

    const apply = (groupId: number, value: boolean) => {
        Helpers.put<number>(`/api/userGroups/${groupId}/isBanned=${value ? 1 : 0}`, {})
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
                    apply(props.group.id, !isBanned);
                }}
            >
                <BanIcon />
            </ToggleButton>
        </Tooltip>
    )

}