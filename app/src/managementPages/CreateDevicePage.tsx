import { useContext } from "react";
import { CurrentPage, PageContext } from "./ManagementIndex";
import { DeviceCreateForm } from "../DeviceCreateForm";

export interface CreateDeviceProps {

}

export function CreateDevicePage() {
    const pageContext = useContext(PageContext);
    return (
        <>
            <p>
                new device detected. please name this device
            </p>
            <DeviceCreateForm id={"123456abcdef"} 
                onCreated={() => pageContext.setCurrentPage(CurrentPage.manageDevices)} />
        </>
    )
}