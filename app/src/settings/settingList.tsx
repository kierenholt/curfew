import { useContext, } from "react"
import { List, ListItem, ListItemButton, ListItemDecorator, ListItemContent, Button } from "@mui/joy";
import { ISetting } from "./ISetting";
import { CurrentPage, PageContext } from "../pageSelector/pageSelector";
import SettingsIcon from '@mui/icons-material/Settings';

export interface SettingListProps {
    settings: ISetting[];
}

export function SettingList(props: SettingListProps) {
    const pageContext = useContext(PageContext);

    return (<List>
        {props.settings.map((g: ISetting) =>
            <ListItem color="neutral" key={g.key}

                endAction={
                    <Button aria-label="Edit" size="sm" variant="soft" color="primary"
                        onClick={() => {
                            pageContext.setParams({ key: g.key })
                            pageContext.goTo(CurrentPage.editSetting)
                        }}>
                        Edit
                    </Button>
                }>
                <ListItemButton>
                    <ListItemDecorator>
                        <SettingsIcon />
                    </ListItemDecorator>
                    <ListItemContent>
                        {g.label}: {g.value}
                    </ListItemContent>
                </ListItemButton>
            </ListItem>)}
    </List>
    )
}