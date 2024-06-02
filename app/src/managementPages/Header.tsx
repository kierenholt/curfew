import { Stack } from "@mui/material"
import { UserIcon, DeviceIcon, AdministratorIcon } from "../Icon"
import { useContext } from "react";
import { UserContext } from "./DetectUser";


export const Header = () => {
    const userContext = useContext(UserContext);

    return (
        userContext &&
        <Stack direction="row" justifyContent="space-around">
            {userContext.user == null
                ?
                <></>
                :
                <p>
                    {
                        userContext.user.isAdministrator 
                        ?
                        <AdministratorIcon />
                        :
                        <UserIcon />
                    }
                    {userContext.user.name}
                </p>}
            {userContext.device == null
                ?
                <></>
                :
                <p><DeviceIcon />{userContext.device.name}</p>
            }
        </Stack>
    )
}