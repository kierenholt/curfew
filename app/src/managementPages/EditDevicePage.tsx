import { useContext } from "react";
import { DeviceEditForm } from "../DeviceEditForm";
import { PageContext } from "./PageContent";

export interface EditDevicePageProps {
    params: any  //deviceId
}

export function EditDevicePage(props: EditDevicePageProps) {
    const pageContext = useContext(PageContext);
    return (
        <>
            <p>
                Edit Device details
            </p>
            <DeviceEditForm 
                onEdited={() => pageContext.goBack()} 
                id={props.params.deviceId} />
        </>
    )
}