import { Accordion, Box, AccordionSummary, Typography, AccordionDetails, IconButton } from "@mui/material";
import { CSSProperties, useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Stack } from "@mui/joy";
import { IDnsResponseGrouping } from "./IDnsResponseGrouping";
import DnsIcon from '@mui/icons-material/Dns';
import FlagIcon from '@mui/icons-material/Flag';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Helpers } from "../helpers";

export interface DnsResponseListItemProps {
    responseGroup: IDnsResponseGrouping;
}

export const DnsResponseListItem = (props: DnsResponseListItemProps) => {

    let [expanded, setExpanded] = useState<boolean>(false);
    let [flagged, setFlagged] = useState<boolean>(props.responseGroup.flagged);
    let [hidden, setHidden] = useState<boolean>(props.responseGroup.hidden);

    const hideButtonHandler = (value: boolean) => {
        Helpers.post('/api/domain/hidden/', { domain: props.responseGroup.domainName, value: value ? 1 : 0 })
            .then((success: boolean) => {
                if (success) {
                    setHidden(value);
                }
            });
    }

    const flagButtonHandler = (value: boolean) => {
        Helpers.post('/api/domain/flagged/', { domain: props.responseGroup.domainName, value: value ? 1 : 0 })
            .then((success: boolean) => {
                if (success) {
                    setFlagged(value);
                }
            });
    }

    const flaggedStyle: CSSProperties = {
        color: "blue"
    }

    const unflaggedStyle: CSSProperties = {
        color: "grey"
    }

    const hiddenStyle: CSSProperties = {
        color: "black"
    }

    const unhiddenStyle: CSSProperties = {
        color: "grey"
    }

    return (
        <Accordion color="neutral" expanded={expanded}>

            <Box sx={{ display: "flex" }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel2a-header"
                    sx={{ flexGrow: 1 }}
                    onClick={() => setExpanded(!expanded)}
                >
                    <DnsIcon />
                    <Typography sx={{ transform: "translateY(0%)", marginLeft: "1rem" }}>
                        {props.responseGroup.domainName}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}></Box>
                    <IconButton aria-label="flag" sx={flagged ? flaggedStyle : unflaggedStyle}
                        onClick={() => flagButtonHandler(!flagged)}>
                        <FlagIcon />
                    </IconButton>
                    <IconButton aria-label="hide" sx={hidden ? hiddenStyle : unhiddenStyle}
                        onClick={() => hideButtonHandler(!hidden)}>
                        <VisibilityOffIcon />
                    </IconButton>
                </AccordionSummary>
            </Box>
            <AccordionDetails>
                <Stack spacing={1}>
                    IPs: {props.responseGroup.ips.length}
                    <br></br>

                </Stack>
            </AccordionDetails>
        </Accordion>
    )
}