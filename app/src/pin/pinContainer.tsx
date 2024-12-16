import Grid from "@mui/material/Grid";
import { Helpers } from "../helpers";
import Button from "@mui/material/Button";
import { ReactNode, useState } from "react";

export interface PasswordContainerProps {
    children: ReactNode;
}

export function PinContainer(props: PasswordContainerProps) {
    let [pressed, setPressed] = useState<string>("");
    let [success, setSuccess] = useState<boolean>(false);

    const itemCss = {
        textAlign: "center",
        fontSize: "2rem",
        width: "100%",
    };

    const gridCss = {
        maxWidth: "500px",
        margin: "auto",
    }

    const onButtonPress = (n: number) => {
        let newString = (pressed + n.toString());
        let len = newString.length;
        newString = newString.substring(len - 4);
        setPressed(newString);

        Helpers.post<boolean>(`/api/check-pin`, { pin: newString })
            .then((isMatch: boolean) => {
                setSuccess(isMatch || success);
            })
    }

    return (
        success ?
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
    )
}