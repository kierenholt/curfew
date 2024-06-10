import { useContext } from "react";
import { DeviceEditForm } from "../DeviceEditForm";
import { CurrentPage, PageContext } from "./PageContent";

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
            <DeviceEditForm onEdited={() => pageContext.setCurrentPage(CurrentPage.manageGroups)} 
                id={props.params.deviceId} />
        </>
    )
}