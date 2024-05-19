import { Button } from "@mui/material";
import { useContext } from "react";
import { CurrentPage, PageContext } from "../PageContext";
import { DeviceList } from "../DeviceList";

export interface ManageDevicesProps {

}

export function ManageDevicesPage() {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>list of devices</p>
            <DeviceList />
            <Button onClick={() => pageContext.setCurrentPage(CurrentPage.createDevice)} >
                create a new Device
            </Button>
        </>
    )
}