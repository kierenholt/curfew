import { useContext, } from "react"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, IconButton } from "@mui/joy";
import { ISetting } from "./types";
import { Edit } from "@mui/icons-material";
import { CurrentPage, PageContext } from "./managementPages/PageContent";
import { SettingIcon } from "./Icon";

export interface SettingListProps {
    settings: ISetting[];
} 

export function SettingList(props: SettingListProps) {
    const pageContext = useContext(PageContext);

    return (<List>
        {props.settings.map((g: ISetting) =>
            <ListItem color="neutral" key={g.key}

                endAction={
                    <IconButton aria-label="Edit" size="sm" variant="plain" color="neutral"
                        onClick={() => {
                            pageContext.setParams({key: g.key})
                            pageContext.goTo(CurrentPage.editSetting)
                        }}>
                        <Edit />
                    </IconButton>
                }>
                <ListItemButton>
                    <ListItemDecorator>
                        <SettingIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                        {g.label}: {g.value}
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}