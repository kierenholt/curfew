import { FormGroup } from "@mui/material";
import { useEffect, useState } from "react";
import { IDevice, IUser, IUserGroup } from "../types";
import { Helpers } from "../helpers";
import { DeviceSetBan } from "../DeviceSetBan";
import { UserSetBan } from "../UserSetBan";
import { GroupSetBan } from "../GroupSetBan";

export function ManageBansPage() {
    const [devices, setDevices] = useState<IDevice[]>([])
    const [users, setUsers] = useState<IUser[]>([])
    const [groups, setGroups] = useState<IUserGroup[]>([])

    useEffect(() => {

        Helpers.get<IDevice[]>("/api/devices/")
            .then((devices: IDevice[]) => {
                setDevices(devices)
            })

        Helpers.get<IUser[]>("/api/users/")
            .then((users: IUser[]) => {
                setUsers(users)
            });

        Helpers.get<IUserGroup[]>("/api/userGroups/")
            .then((groups: IUserGroup[]) => {
                setGroups(groups)
            })

    }, [])


    return (
        <FormGroup>

            <p>devices</p>
            {devices.map(d => 
                <DeviceSetBan deviceId={d.id} />
            )}
            
            <p>users</p>
            {users.map(d => 
                <UserSetBan userId={d.id} />
            )}

            <p>groups</p>
            {groups.map(d => 
                <GroupSetBan groupId={d.id} />
            )};

        </FormGroup>
    )
}