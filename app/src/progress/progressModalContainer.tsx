import { createContext, ReactNode, useState } from "react";
import ProgressModal from "./progressModal";


interface ShowProgressAction {
    setOpen: (value: boolean) => void;
    setNonce: (value: number) => void;
    setOnSuccess: any;
}

export const ProgressContext = createContext<ShowProgressAction>(
    { setOpen: () => null, setNonce: () => null, setOnSuccess: null }
);

export interface ProgressModalContainerProps {
    children: ReactNode;
}

export function ProgressModalContainer(props: ProgressModalContainerProps) {


    const [open, setOpen] = useState<boolean>(false);
    const [nonce, setNonce] = useState<number>(0);
    const [onSuccess, setOnSuccess] = useState<any>(null);

    return (
        <ProgressContext.Provider value={{ setOpen, setNonce, setOnSuccess }}>
            {props.children}
            <ProgressModal open={open} nonce={nonce} setOpen={setOpen} onSuccess={onSuccess} />
        </ProgressContext.Provider>
    )
}