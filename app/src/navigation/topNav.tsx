import { useContext } from "react";
import { CurrentPage, PageContext } from "../pageSelector/pageSelector";
import SettingsIcon from '@mui/icons-material/Settings';
import TimerIcon from '@mui/icons-material/Timer';
import { IconButton, Stack } from "@mui/joy";
import AppBlockingIcon from '@mui/icons-material/AppBlocking';
import DnsIcon from '@mui/icons-material/Dns';

export function TopNav() {

    const pageContext = useContext(PageContext);

    return (
        <Stack direction="row" spacing={1}>
            <IconButton sx={{marginLeft:"auto"}} 
                onClick={() => { pageContext.goTo(CurrentPage.keywords) }} 
                variant={pageContext.current == CurrentPage.keywords ? "solid" : "plain"}>
                < AppBlockingIcon />
            </IconButton >
            <IconButton sx={{marginLeft:"auto"}} 
                onClick={() => { pageContext.goTo(CurrentPage.timer) }} 
                variant={pageContext.current == CurrentPage.timer ? "solid" : "plain"}>
                <TimerIcon />
            </IconButton >
            <IconButton sx={{marginLeft:"auto"}} 
                onClick={() => { pageContext.goTo(CurrentPage.manageSettings) }} 
                variant={pageContext.current == CurrentPage.manageSettings ? "solid" : "plain"}>
                <SettingsIcon />
            </IconButton >
            <IconButton sx={{marginLeft:"auto"}} 
                onClick={() => { pageContext.goTo(CurrentPage.dnsResponses) }} 
                variant={pageContext.current == CurrentPage.dnsResponses ? "solid" : "plain"}>
                <DnsIcon />
            </IconButton >
        </Stack>
    )
}