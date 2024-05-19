import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { IUser } from "./types";

export interface UserSelectProps {
    selectedUserId: number;
    setSelecterUserId: (n: number) => void;
}

export function UserSelect(props: UserSelectProps) {
    const [Users, setUsers] = useState<IUser[]>([]);

    useEffect(() => {
        Helpers.get<IUser[]>("/api/users/")
            .then((Users: IUser[]) => {
                setUsers(Users)
        })
    }, []);

    const handleChange = (event: SelectChangeEvent) => {
        props.setSelecterUserId(Number(event.target.value));
      };

    return (
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Owner</InputLabel>
            <Select
                labelId="User-select-label"
                id="User-select"
                label="Owner"
                value={props.selectedUserId == null ? "" : props.selectedUserId.toString()}
                onChange={handleChange}
            >
                {Users.map(g => 
                    <MenuItem value={g.id}>{g.name}</MenuItem>
                )}
            </Select>
        </FormControl>
    )
}