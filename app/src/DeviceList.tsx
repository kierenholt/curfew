import { useContext, useEffect, useState } from "react"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import { IDevice } from "./types";
import { Helpers } from "./helpers";
import { Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./PageContext";
import DevicesIcon from '@mui/icons-material/Devices';


export function DeviceList() {
    const pageContext = useContext(PageContext);
    let [Devices, setDevices] = useState<IDevice[]>([]);

    useEffect(() => {
        Helpers.get<IDevice[]>("/api/devices/")
            .then((Devices: IDevice[]) => {
                setDevices(Devices)
            })
    }, []);

    return (<List>
        {Devices.map((g: IDevice) =>
            <ListItem color="neutral"

                endAction={
                    <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                        onClick={() => {
                            pageContext.setParams({mac: g.MAC})
                            pageContext.setCurrentPage(CurrentPage.editDevice)
                        }}>
                        <Edit />
                    </IconButton>
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