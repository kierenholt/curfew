import { useEffect, useState } from "react";
import { Helpers } from "../helpers";
import { Stack } from "@mui/material";
import { TimerKeywordsList } from "./timerKeywordsList";
import { IKeyword } from "../keywords/IKeyword";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from "dayjs";

//https://day.js.org/docs/en/display/format
export function TimerPage() {
    let [ids, setIds] = useState<number[]>([]);
    let [dayjsValue, setDayjsValue] = useState<Dayjs | null>(null);
    let [newTick, setNewTick] = useState<boolean>(false);
    let [lastApplied, setLastApplied] = useState<number>(-1);

    useEffect(() => {
        Helpers.get<IKeyword[]>(`/api/keywords/`)
            .then((keywords: IKeyword[]) => {
                setIds(keywords.map(k => k.id));
            });

        Helpers.get<number>(`/api/timer/seconds-ahead`)
            .then((seconds: number) => {
                if (seconds != -1) {
                    let dayjs = secondsToDayjs(seconds)
                    setDayjsValue(dayjs);
                    setTimeout(() => { setNewTick(!newTick); }, 900);
                }
                else {
                    setDayjsValue(null);
                }
            });
        
        Helpers.get<number>(`/api/timer/last-applied`)
            .then((lastAppliedValue: number) => {
                setLastApplied(lastAppliedValue);
            });
    }, [newTick]);

    const secondsToDayjs = (seconds: number): Dayjs => {
        let newValue = dayjs().set('hours', 0).set('minutes', 0).set('seconds', seconds);
        return newValue;
    }

    const dayjsToSeconds = (value: Dayjs) => {
        return value.get('hours')*3600 + value.get('minutes')*60 + value.get('seconds'); 
    }

    const onTimeChange = (value: Dayjs | null) => {
        if (value) {
            let seconds = dayjsToSeconds(value);
            Helpers.post<boolean>(`/api/timer/seconds-ahead`, {value: seconds})
                .then((success: boolean) => {
                    if (success) {
                        setDayjsValue(value);
                        setNewTick(!newTick);
                    }
                });
        }
    }

    return (
        <>
            <Stack direction="column" justifyContent="space-between" alignItems="baseline">
                <h2>Timer</h2>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker views={['hours', 'minutes', 'seconds']} 
                        format="HH:mm:ss" 
                        value={dayjsValue}
                        onChange={(value: Dayjs | null) => onTimeChange(value)}
                        ampm={false}
                        />
                </LocalizationProvider>
                {
                    dayjsValue == null 
                    ? 
                    <>
                        <p>Choose the hours minutes and seconds to start the timer</p>
                    </>
                    :
                    <>
                        <p>When the timer runs out, the following settings will be applied:</p>
                        <TimerKeywordsList ids={ids} />
                    </>
                }
                {
                    lastApplied == -1 
                    ?
                    <></>
                    :
                    <>
                        <p>
                            LAST APPLIED ON: {dayjs(lastApplied).format('D MMM HH:mm')}
                        </p>
                    </>
                }
            </Stack>
        </>
    )
}