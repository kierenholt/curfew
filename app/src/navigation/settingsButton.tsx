import { useContext } from "react";
import { CurrentPage, PageContext } from "../pageSelector/pageSelector";

import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton } from "@mui/joy";

export function SettingsOrHomeButton() {

    const pageContext = useContext(PageContext);

    return (
        pageContext.current == CurrentPage.keywords
            ?
            <IconButton sx={{marginLeft:"auto"}} onClick={() => { pageContext.goTo(CurrentPage.manageSettings) }} >
                <SettingsIcon />
            </IconButton >
            :
            <IconButton sx={{marginLeft:"auto"}} onClick={() => { pageContext.goTo(CurrentPage.keywords) }} >
                <HomeIcon />
            </IconButton >
    )
}