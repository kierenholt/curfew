import { useContext, useEffect, useState } from "react"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import { IDevice } from "./types";
import { Helpers } from "./helpers";
import { Delete, Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { DeviceIcon, RequestIcon } from "./Icon";
import { DateFormatter } from "./DateFormatter";


export function DeviceList() {
    const pageContext = useContext(PageContext);
    let [devices, setDevices] = useState<IDevice[]>([]);

    useEffect(() => {
        Helpers.get<IDevice[]>("/api/devices/")
            .then((Devices: IDevice[]) => {
                setDevices(Devices)
            })
    }, []);


    const deleteDevice = (id: string) => {
        Helpers.delete(`/api/devices/${id}`)
            .then((deleted: number) => {
                console.log("deleted: " + deleted);
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
                                ` last requested ${DateFormatter.agoFormat(g.lastRequestedOn)}`
                                :
                                ``
                        }
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}