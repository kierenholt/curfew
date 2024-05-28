import { Button, Checkbox, FormControlLabel, FormGroup, TextField } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { Helpers } from "./helpers";
import { IQuota } from "./types";
import { Day } from "./Day";

interface QuotaEditFormProps {
    onEdited: () => void;
    groupId: number;
    day: number;
}

export function QuotaEditForm(props: QuotaEditFormProps) {
    const [refreshAmount, setRefreshAmount] = useState<number>(0);
    const [rollsOver, setRollsOver] = useState<boolean>(false);
    const [maxDuration, setMaxDuration] = useState<number>(0);
    const [cooldown, setCooldown] = useState<number>(0);

    useEffect(() => {
        Helpers.get<IQuota>(`/api/quotas/${props.groupId}&${props.day}`)
            .then((quota: IQuota) => {
                console.log(quota);
                setRefreshAmount(quota.refreshAmount);
                setRollsOver(quota.rollsOver);
                setMaxDuration(quota.maxDuration);
                setCooldown(quota.cooldown);
            })
    }, [props.groupId, props.day])

    const save = () => {
        if (props.groupId > 0)
            Helpers.put<number>(`/api/quotas/${props.groupId}-${props.day}`,
                {
                    refreshAmount: refreshAmount, rollsOver: rollsOver,
                    maxDuration: maxDuration, cooldown: cooldown
                })
                .then((updated: number) => {
                    if (updated > 0) {
                        props.onEdited();
                    }
                })
    }

    return (
        <>
            <p>
                update <Day day={props.day} full={true} />'s quota
            </p>
            <FormGroup>
                <TextField
                    id="refreshAmount"
                    label=""
                    defaultValue=""
                    helperText="total minutes per day"
                    variant="standard"
                    value={refreshAmount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setRefreshAmount(Number(e.target.value));
                    }}
                />
                <FormControlLabel control={
                    <Checkbox onChange={(e) => setRollsOver(e.target.checked)} 
                        checked={rollsOver}/>
                } label="Rolls over from previous day" />

                <TextField
                    id="maxDuration"
                    label=""
                    defaultValue=""
                    helperText="maximum length of one session"
                    variant="standard"
                    value={maxDuration}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setMaxDuration(Number(e.target.value));
                    }}
                />

                <TextField
                    id="coolDown"
                    label=""
                    defaultValue=""
                    helperText="minimum enforced break length between sessions"
                    variant="standard"
                    value={cooldown}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setCooldown(Number(e.target.value));
                    }}
                />

                <Button onClick={save} >Save</Button>
            </FormGroup>
        </>
    )
}