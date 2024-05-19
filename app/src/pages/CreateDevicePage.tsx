import { Button } from "@mui/material";
import { useContext } from "react";
import { CurrentPage, PageContext } from "../PageContext";
import { DeviceCreateForm } from "../DeviceCreateForm";

export interface NameThisDeviceProps {

}

export function CreateDevicePage() {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                name this device
            </p>
            <DeviceCreateForm MAC={"13:14"} onCreated={() => null} />
            <Button onClick={() => pageContext.setCurrentPage(CurrentPage.manageUsers)} >
                manage users
            </Button>
        </>
    )
}