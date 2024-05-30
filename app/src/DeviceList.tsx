import { useContext, useEffect, useState } from "react"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import { IDevice } from "./types";
import { Helpers } from "./helpers";
import { Delete, Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import DevicesIcon from '@mui/icons-material/Devices';
import { RequestIcon } from "./Icon";


export function DeviceList() {
    const pageContext = useContext(PageContext);
    let [devices, setDevices] = useState<IDevice[]>([]);

    useEffect(() => {
        Helpers.get<IDevice[]>("/api/devices/")
            .then((Devices: IDevice[]) => {
                setDevices(Devices)
            })
    }, []);


    const linkToRequests = (d: IDevice): React.ReactNode => {
        return <RequestIcon onClick={() => {
            pageContext.setParams({deviceId: d.id});
            pageContext.setCurrentPage(CurrentPage.manageRequests);
        }} />
    }

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
                    {linkToRequests(g)}
                    <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                        onClick={() => {
                            pageContext.setParams({deviceId: g.id})
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
                        <DevicesIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                        {g.name}
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}