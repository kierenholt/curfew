import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { IUserGroup } from "./types";

export interface GroupSelectProps {
    onSelect: (id: number) => void;
}

export function GroupSelect(props: GroupSelectProps) {
    const [groups, setGroups] = useState<IUserGroup[]>([]);

    useEffect(() => {
        Helpers.get<IUserGroup[]>("/api/userGroups/")
            .then((groups: IUserGroup[]) => {
                setGroups(groups)
        })
    });

    const handleChange = (event: SelectChangeEvent) => {
        props.onSelect(Number(event.target.value));
      };

    return (
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">User Group</InputLabel>
            <Select
                labelId="suer-group-select-label"
                id="user-group-select"
                label="User group"
                onChange={handleChange}
            >
                {groups.map(g => 
                    <MenuItem value={g.id}>{g.name}</MenuItem>
                )}
            </Select>
        </FormControl>
    )
}