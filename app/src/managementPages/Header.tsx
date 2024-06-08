import { Stack } from "@mui/material"
import { UserIconIcon, DeviceIcon, AdministratorIcon } from "../Icon"
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
                        <UserIconIcon />
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