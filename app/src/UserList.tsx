import { Stack } from "@mui/material";
import { IUser } from "./types";
import { UserListItem } from "./UserListItem";

export interface UserListProps {
    initialUsers: IUser[];
}

export function UserList(props: UserListProps) {

    return (
        <Stack direction="column">
            {props.initialUsers.map((g: IUser) => <UserListItem user={g} />)}
        </Stack>
    )
}