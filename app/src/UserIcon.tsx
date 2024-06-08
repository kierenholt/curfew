import { Tooltip } from "@mui/material"
import { AdministratorIcon, UserIconIcon } from "./Icon"
import { IUser } from "./types"

export interface UserIconProps {
    user: IUser;
}

export const UserIcon = (props: UserIconProps) => {

    return (
        <>
            {
                props.user.isAdministrator
                    ?
                    <Tooltip title={"this user is an administrator"}>
                        <AdministratorIcon />
                    </Tooltip>
                    :
                    <UserIconIcon />
            }
        </>
    )
}