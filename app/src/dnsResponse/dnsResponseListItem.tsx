import { Accordion, Box, AccordionSummary, Typography, AccordionDetails } from "@mui/material";
import { useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Stack } from "@mui/joy";
import { IDnsResponseGrouping } from "./IDnsResponseGrouping";
import DnsIcon from '@mui/icons-material/Dns';


export interface DnsResponseListItemProps {
    responseGroup: IDnsResponseGrouping;
}

export const DnsResponseListItem = (props: DnsResponseListItemProps) => {

    let [expanded, setExpanded] = useState<boolean>(false);

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
                    <Typography>
                        some text
                    </Typography>
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