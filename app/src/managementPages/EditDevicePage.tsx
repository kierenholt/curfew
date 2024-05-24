import { useContext } from "react";
import { DeviceEditForm } from "../DeviceEditForm";
import { CurrentPage, PageContext } from "./ManagementIndex";

export interface EditDevicePageProps {
    params: any
}

export function EditDevicePage(props: EditDevicePageProps) {
    const pageContext = useContext(PageContext);
    return (
        <>
            <p>
                Edit Device details
            </p>
            <DeviceEditForm onEdited={() => pageContext.setCurrentPage(CurrentPage.manageDevices)} 
                id={props.params.deviceId} />
        </>
    )
}