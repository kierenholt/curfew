import { useContext, useState } from "react";
import { DeviceSelect } from "../DeviceSelect";
import { RequestListWrapper } from "../RequestListWrapper";
import { UserContext } from "./DetectUser";

export interface ManageRequestsProps {
    params: any; //deviceId
}

export function ManageRequestsPage(props: ManageRequestsProps) {
    const userContext = useContext(UserContext);
    const [deviceId, setDeviceId] = useState<string>(props.params?.deviceId ?? "");

    return (
        <>
            <p>list of requests for device:</p>
            <DeviceSelect selectedDeviceId={deviceId}
                setSelectedDeviceId={(id: string) => setDeviceId(id)} />
            {
            userContext?.group.isUnrestricted 
            ? 
            <p>your requests are not logged because you are in an unrestricted group</p>
            :
            deviceId && <RequestListWrapper deviceId={deviceId} />
            }
        </>
    )
}