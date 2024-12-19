import Grid from "@mui/material/Grid";
import { Helpers } from "../helpers";
import { ReactNode, useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import { ISetting, SettingKey } from "../settings/ISetting";

export interface PasswordContainerProps {
    children: ReactNode;
}

export function PinContainer(props: PasswordContainerProps) {
    let [pressed, setPressed] = useState<string>("");
    let [success, setSuccess] = useState<boolean>(false);
    let button = useRef<HTMLDivElement>(null);
    let [assigned, setAssigned] = useState<boolean>(false);
    const [inactivityTimeout, setInactivityTimeout] = useState<number>(0);

    const itemCss = {
        textAlign: "center",
        fontSize: "2rem",
        width: "100%",
    };

    const gridCss = {
        maxWidth: "500px",
        margin: "auto",
    };

    useEffect(() => {
        Helpers.get<ISetting>(`/api/settings/` + SettingKey.inactivityLockSecs)
            .then((Setting: ISetting) => {
                setInactivityTimeout(Number(Setting.value));
            })
    }, []);

    //create a promise, return resolve to the promise
    if (button.current && !assigned && success && inactivityTimeout > 0) {
        setAssigned(true);
        const startTimer = () => new Promise((resolve, reject) => {
            console.log("starting timer");
            if (button.current) {
                button.current.onclick = () => resolve(true);
                setTimeout(() => resolve(false), Math.ceil(inactivityTimeout * 1000));
            }
        })
            .then((clicked) => {
                if (clicked) startTimer();
                else {
                    console.log("out of time");
                    setAssigned(false);
                    setSuccess(false);
                    setPressed("");
                }
            });
        startTimer();
    }

    const onButtonPress = (n: number) => {
        let newString = (pressed + n.toString());
        let len = newString.length;
        newString = newString.substring(len - 4);
        setPressed(newString);

        Helpers.post<boolean>(`/api/check-pin`, { pin: newString })
            .then((isMatch: boolean) => {
                setSuccess(isMatch || success);
            });
    }

    return (
        <div ref={button}>
            {success ?
                <>
                    {props.children}
                </>
                :
                <Grid container sx={gridCss} spacing={2}>
                    {
                        Helpers.range(1, 10).map(i =>
                            <Grid item xs={4} key={i}>
                                <Button sx={itemCss} onClick={() => onButtonPress(i)}>{i}</Button>
                            </Grid>)
                    }
                    <Grid item xs={4} sx={{ margin: "auto" }}>
                        <Button sx={itemCss} onClick={() => onButtonPress(0)}>0</Button>
                    </Grid>
                </Grid>
            }
        </div>
    )
}