import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { IUser } from "./types";

export interface UserSelectProps {
    selectedUserId: number;
    setSelectedUserId: (n: number) => void;
}

export function UserSelect(props: UserSelectProps) {
    const [users, setUsers] = useState<IUser[]>([]);

    useEffect(() => {
        Helpers.get<IUser[]>("/api/users/")
            .then((users: IUser[]) => {
                setUsers(users)
        })
    }, []);

    const handleChange = (event: SelectChangeEvent) => {
        props.setSelectedUserId(Number(event.target.value));
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
                {users.map(g => 
                    <MenuItem value={g.id}>{g.name}</MenuItem>
                )}
            </Select>
        </FormControl>
    )
}