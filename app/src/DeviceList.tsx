import { useContext, useState } from "react"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import { IDevice } from "./types";
import { Helpers } from "./helpers";
import { Delete, Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { DeviceIcon, RequestIcon } from "./Icon";
import { DateFormatter } from "./DateFormatter";
import { DeviceBanToggleButton } from "./DeviceBanToggleButton";

export interface DeviceListProps {
    initialDevices: IDevice[];
}

export function DeviceList(props: DeviceListProps) {
    const pageContext = useContext(PageContext);
    const [devices, setDevices] = useState<IDevice[]>(props.initialDevices)


    const deleteDevice = (id: string) => {
        Helpers.delete(`/api/devices/${id}`)
            .then((deleted: number) => {
                if (deleted > 0) {
                    setDevices(devices.filter(g => g.id !== id));
                }
            })
    }

    return (<List>
        {devices.map((g: IDevice) =>
            <ListItem color="neutral"

                endAction={
                    <>
                        <DeviceBanToggleButton device={g} />
                        <IconButton aria-label="Requests" size="sm" variant="plain" color="neutral"
                            onClick={() => {
                                pageContext.setParams({ deviceId: g.id });
                                pageContext.setCurrentPage(CurrentPage.manageRequests);
                            }} >
                            <RequestIcon />
                        </IconButton>
                        <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                            onClick={() => {
                                pageContext.setParams({ deviceId: g.id })
                                pageContext.setCurrentPage(CurrentPage.editDevice)
                            }}>
                            <Edit />
                        </IconButton>
                        <IconButton aria-label="Delete" size="sm" variant="plain" color="neutral"
                            onClick={() => deleteDevice(g.id)}>
                            <Delete />
                        </IconButton>
                    </>
                }>
                <ListItemButton>
                    <ListItemDecorator>
                        <DeviceIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                        {g.name}
                        {
                            g.lastRequestedOn
                                ?
                                ` last requested ${DateFormatter.ago(g.lastRequestedOn)}`
                                :
                                ``
                        }
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}