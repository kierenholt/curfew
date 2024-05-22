
import { Button, FormGroup, Slider } from "@mui/material";
import { useState } from "react";
import { Helpers } from "./helpers";
import { IQuota } from "./types";

interface BookingCreateFormProps {
    onCreated: () => void;
    userId: number;
    quota: IQuota;
    maxDurationOfNextBook: number
}

export function BookingCreateForm(props: BookingCreateFormProps) {
    const [duration, setDuration] = useState<number>(0);

    const save = () => {
        if (duration > 0)
            Helpers.post<number>(`/api/bookings`,
                {
                    userId: props.userId,
                    duration: duration
                })
                .then((deviceid: number) => {
                    if (deviceid > 0) {
                        props.onCreated();
                    }
                });
    }

    const handleChange = (event: Event, newValue: number | number[]) => {
        setDuration(newValue as number);
    };

    return (
        <FormGroup>
            <p>
                The longest you can book for is {props.maxDurationOfNextBook} minutes.
            </p>
            <Slider
                defaultValue={0}
                min={0}
                max={props.maxDurationOfNextBook}
                step={5}
                valueLabelDisplay="on"
                onChange={handleChange}
            />

            <Button onClick={save} >Save</Button>
        </FormGroup>
    )
}