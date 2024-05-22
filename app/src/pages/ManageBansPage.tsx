import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import { useEffect, useState } from "react";
import { IDevice, IUser, IUserGroup } from "../types";
import { Helpers } from "../helpers";

export function ManageBansPage() {
    const [devices, setDevices] = useState<IDevice[]>([])
    const [users, setUsers] = useState<IUser[]>([])
    const [groups, setGroups] = useState<IUserGroup[]>([])

    useEffect(() => {

        Helpers.get<IUser[]>("/api/users/")
            .then((users: IUser[]) => {
                setUsers(users)
            });

        Helpers.get<IUserGroup[]>("/api/userGroups/")
            .then((groups: IUserGroup[]) => {
                setGroups(groups)
            })

        Helpers.get<IDevice[]>("/api/devices/")
        .then((Devices: IDevice[]) => {
            setDevices(Devices)
        })
    })



    const setUserBan = (u: IUser, isBanned: boolean) => {
        Helpers.put<number>(`/api/users/${u.id}/isBanned=${isBanned ? 1 : 0}`, {})
            .then((updated: number) => updated)
    }
    const setGroupBan = (u: IUserGroup, isBanned: boolean) => {
        Helpers.put<number>(`/api/userGroups/${u.id}/isBanned=${isBanned ? 1 : 0}`, {})
            .then((updated: number) => updated)
    }
    const setDeviceBan = (u: IDevice, isBanned: boolean) => {
        Helpers.put<number>(`/api/devices/${u.id}/isBanned=${isBanned ? 1 : 0}`, {})
            .then((updated: number) => updated)
    }

    return (
        <FormGroup>

            <p>devices</p>
            {devices.map(d => 
                <FormControlLabel control={
                    <Switch 
                        checked={d.isBanned}
                        onChange={
                            (event: React.ChangeEvent<HTMLInputElement>) => {
                                setDeviceBan(d, event.target.checked);
                            }
                        }/>
                } label={d.name} />
            )}
            
            <p>users</p>
            {users.map(d => 
                <FormControlLabel control={
                    <Switch 
                        checked={d.isBanned}
                        onChange={
                            (event: React.ChangeEvent<HTMLInputElement>) => {
                                setUserBan(d, event.target.checked);
                            }
                        }/>
                } label={d.name} />
            )}

            <p>groups</p>
            {groups.map(d => 
                <FormControlLabel control={
                    <Switch 
                        checked={d.isBanned}
                        onChange={
                            (event: React.ChangeEvent<HTMLInputElement>) => {
                                setGroupBan(d, event.target.checked);
                            }
                        }/>
                } label={d.name} />
            )}

        </FormGroup>
    )
}