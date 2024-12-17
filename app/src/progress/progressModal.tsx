import * as React from 'react';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { useEffect, useState } from 'react';
import { Helpers } from '../helpers';
import { IProgressMessage } from './IProgressMessage';

export interface ProgressModalProps {
    setOpen: (b: boolean) => void;
    open: boolean;
    nonce: number;
    onSuccess: () => void;
}

export default function ProgressModal(props: ProgressModalProps) {

    const [text, setText] = useState<string>("");

    useEffect(() => {
        if (props.open) {
            setText("obj.message");
            getForever();
        };
    }, [props.open]);

    const getForever = (): Promise<void> => {
        return Helpers.get<IProgressMessage>(`/api/progress/${props.nonce}`)
            .then((obj: IProgressMessage) => {
                setText(obj.message);
                if (obj.isSuccess) {
                    if (props.onSuccess) props.onSuccess();
                    return Helpers.delay(1000)
                        .then(() => props.setOpen(false));
                }
                else {
                    return Helpers.delay(100)
                        .then(getForever);
                }
            })
    };

    return (
        <React.Fragment>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={props.open}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    variant="outlined"
                    sx={{ maxWidth: 500, borderRadius: 'md', p: 3, boxShadow: 'lg' }}
                >
                    <Typography
                        component="h2"
                        id="modal-title"
                        level="h4"
                        textColor="inherit"
                        sx={{ fontWeight: 'lg', mb: 1 }}
                    >
                        Please wait
                    </Typography>
                    <Typography id="modal-desc" textColor="text.tertiary">
                        {text}
                    </Typography>
                </Sheet>
            </Modal>
        </React.Fragment>
    );
}
