import { IconButton, Stack } from "@mui/material"
import { UserIconIcon, DeviceIcon, AdministratorIcon, UserGroupIcon } from "../Icon"
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./DetectUser";
import { CurrentPage, PageContext } from "./PageContent";
import { Helpers } from "../helpers";
import { ISetting } from "../types";


export const Header = () => {
    const userContext = useContext(UserContext);
    const pageContext = useContext(PageContext);
    const [showEditLink, setShowEditLink] = useState<boolean>(false);


    useEffect(() => {
        Helpers.get<ISetting>(`/api/settings/4`)
            .then((result: ISetting) => {
                setShowEditLink(result.value === "true");
            });
    })

    return (
        userContext &&
        <Stack direction="row" justifyContent="space-around">
            {userContext.user == null
                ?
                <></>
                :
                <p>
                    {
                        <IconButton
                            onClick={() => {
                                if (showEditLink) {
                                    pageContext.setParams({ userId: userContext.user.id, showAdminBox: false });
                                    pageContext.goTo(CurrentPage.editUser)
                                }
                            }} >
                            {userContext.user.isAdministrator
                                ?
                                <AdministratorIcon />
                                :
                                <UserIconIcon />
                            }
                        </IconButton>
                    }
                    {userContext.user.name}
                </p>}
            {userContext.device == null
                ?
                <></>
                :
                <p>
                    <IconButton
                        onClick={() => {
                            if (showEditLink) {
                                pageContext.setParams({ deviceId: userContext.device.id });
                                pageContext.goTo(CurrentPage.editDevice)
                            }
                        }} >
                        <DeviceIcon />
                    </IconButton>
                    {userContext.device.name}
                </p>
            }
            {userContext.group == null
                ?
                <></>
                :
                <p><UserGroupIcon />{userContext.group.name}</p>
            }
        </Stack>
    )
}