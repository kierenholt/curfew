import { Button } from "@mui/material";
import { useContext } from "react";
import { CurrentPage, PageContext } from "../PageContext";
import { DeviceEditForm } from "../DeviceEditForm";

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
            <DeviceEditForm onEdited={() => {}} mac={props.params.mac} />
            <Button onClick={() => pageContext.setCurrentPage(CurrentPage.manageDevices)} >manage owners</Button>
        </>
    )
}