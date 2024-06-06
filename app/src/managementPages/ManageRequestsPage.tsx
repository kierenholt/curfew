import { useState } from "react";
import { DeviceSelect } from "../DeviceSelect";
import { RequestListWrapper } from "../RequestListWrapper";

export interface ManageRequestsProps {
    params: any; //deviceId
}

export function ManageRequestsPage(props: ManageRequestsProps) {
    const [deviceId, setDeviceId] = useState<string>(props.params?.deviceId ?? "");

    return (
        <>
            <p>list of requests for device:</p>
            <DeviceSelect selectedDeviceId={deviceId}
                setSelectedDeviceId={(id: string) => setDeviceId(id)} />
            {deviceId && <RequestListWrapper deviceId={deviceId} />}
        </>
    )
}