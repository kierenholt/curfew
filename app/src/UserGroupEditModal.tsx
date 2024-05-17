import { Modal, Stack, Typography } from "@mui/joy";
import TextField from '@mui/material/TextField';

import Box from '@mui/material/Box';
import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { IUserGroup } from "./types";

interface UserGroupEditModalProps {
    userGroupId: number;
    onClose: () => void;
}

export const UserGroupEditModal = (props: UserGroupEditModalProps) => {
    const handleClose = () => {
        setIsOpen(false);
        props.onClose();
    }
    const [name, setName] = useState("");
    const [isUnrestricted, setIsUnrestricted] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    
    useEffect(() => {
        Helpers.get<IUserGroup>("/api/userGroups/" + props.userGroupId)
            .then((group: IUserGroup) => {
                if (group) {
                    setIsUnrestricted(group.isUnrestricted);
                    setName(group.name);
                }
                else {
                    handleClose();
                }
            })
    })

    const handleSave = () => {
        Helpers.put<number>(`/api/userGroups/${props.userGroupId}`, {name: name, isUnrestricted: isUnrestricted})
            .then((n: number) => {
                handleClose();
            })
    }

    const style = {
        position: 'absolute' as 'absolute',
        top: '15%',
        bottom: '15%',
        left: '15%',
        right: '15%',
        width: '70%',
        bgcolor: '#fff',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" component="h2">
                    Edit group
                </Typography>
                <Stack direction="column">

                    <TextField
                        id="standard-helperText"
                        label="group name"
                        defaultValue="Default Value"
                        helperText="Some important text"
                        variant="standard"
                        value={name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setName(e.target.value);
                        }}
                    />
                    <ToggleButtonGroup
                        color="primary"
                        value={isUnrestricted}
                        exclusive
                        onChange={(e: any, value: any) => {
                            if (value !== null) {
                                setIsUnrestricted(value);
                            }
                        }}
                        aria-label="Is unrestricted"
                    >
                        <ToggleButton value={false}>Restricted</ToggleButton>
                        <ToggleButton value={true}>Unrestricted</ToggleButton>
                    </ToggleButtonGroup>
                    <Typography id="" component="p">
                        Unrestricted access to websites and apps.
                        It is recommended to enable for adults only.
                    </Typography>

                    <Button onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        OK
                    </Button>
                </Stack>
            </Box>
        </Modal>
    )
}