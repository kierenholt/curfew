import { Edit, Delete } from "@mui/icons-material";
import { ListItem, IconButton, ListItemButton, ListItemDecorator, ListItemContent } from "@mui/joy";
import { DateFormatter } from "./DateFormatter";
import { DeviceBanToggleButton } from "./DeviceBanToggleButton";
import { RequestIcon, UndeleteIcon, DeviceIcon } from "./Icon";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { IDevice } from "./types";
import { Helpers } from "./helpers";
import { useContext, useState } from "react";

interface DeviceListItemProps {
    device: IDevice;
}

export const DeviceListItem = (props: DeviceListItemProps) => {
    const pageContext = useContext(PageContext);
    const [isDeleted, setIsDeleted] = useState<boolean>(props.device.isDeleted)

    const setDeleted = (d: IDevice, value: boolean) => {
        Helpers.put<number>(`/api/devices/${d.id}/isDeleted=${value ? 1 : 0}`, {})
            .then((updated: number) => {
                if (updated > 0) {
                    setIsDeleted(value);
                }
            })
    }


    return (
        <ListItem color="neutral"

            endAction={
                <>
                    <DeviceBanToggleButton device={props.device} />
                    <IconButton aria-label="Requests" size="sm" variant="plain" color="neutral"
                        onClick={() => {
                            pageContext.setParams({ deviceId: props.device.id });
                            pageContext.goTo(CurrentPage.manageRequests);
                        }} >
                        <RequestIcon />
                    </IconButton>
                    <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                        onClick={() => {
                            pageContext.setParams({ deviceId: props.device.id })
                            pageContext.goTo(CurrentPage.editDevice)
                        }}>
                        <Edit />
                    </IconButton>
                    {
                        isDeleted
                            ?
                            <IconButton aria-label="Undelete" size="sm" variant="plain" color="neutral"
                                onClick={() => setDeleted(props.device, false)}>
                                <UndeleteIcon />
                            </IconButton>
                            :
                            <IconButton aria-label="Delete" size="sm" variant="plain" color="neutral"
                                onClick={() => setDeleted(props.device, true)}>
                                <Delete />
                            </IconButton>
                    }
                </>
            }>
            <ListItemButton>
                <ListItemDecorator>
                    <DeviceIcon />
                </ListItemDecorator>
                <ListItemContent>
                    {props.device.name} {isDeleted ? "(deleted)" : ""}
                    {
                        props.device.lastRequestedOn
                            ?
                            ` last requested ${DateFormatter.ago(props.device.lastRequestedOn)}`
                            :
                            ``
                    }
                </ListItemContent>
            </ListItemButton>
        </ListItem>
    )
}