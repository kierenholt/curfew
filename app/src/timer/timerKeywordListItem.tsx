import { Box, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Button, Stack, Switch } from "@mui/joy";
import { Helpers } from "../helpers";
import TimerIcon from '@mui/icons-material/Timer';
import { IKeyword } from "../keywords/IKeyword";
import { KeywordTimerAction } from "./keywordTimerAction";
import { TimerActionToggleButton } from "./timerActionToggleButton";

export interface TimerKeywordListItemProps {
    id: number;
}

export const TimerKeywordListItem = (props: TimerKeywordListItemProps) => {

    let [name, setName] = useState<string>("");

    useEffect(() => {
        Helpers.get<IKeyword>(`/api/keyword/${props.id}`)
            .then((keyword: IKeyword) => {
                setName(keyword.name);
            });

    }, [props.id])

    return (
        <Stack color="neutral" direction="row">
            <TimerIcon />
            <Typography sx={{ transform: "translateY(0%)", marginLeft: "1rem" }}>
                {name}
            </Typography>
            <Box sx={{ flexGrow: 1 }}></Box>
            <TimerActionToggleButton id={props.id} />
        </Stack>
    )
}