import { Helpers } from "../helpers";
import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { SettingKey } from "../settings/ISetting";
import { Stack } from "@mui/material";
import { Button, FormGroup, TextField } from "@mui/material";

export interface SetupContainerProps {
    children: ReactNode;
}

export function SetupContainer(props: SetupContainerProps) {
    let [isSetup, setIsSetup] = useState<boolean>(false);
    let [routerModel, setRouterModel] = useState<string>("... searching");
    let [networkId, setNetworkId] = useState<string>("... searching");
    let [password, setPassword] = useState<string>("");
    let [showPasswordResults, setShowPasswordResults] = useState<boolean>(false);
    let [passwordIsGood, setPasswordIsGood] = useState<boolean>(false);

    useEffect(() => {
        Helpers.get<boolean>(`/api/is-setup`)
            .then((ret: boolean) => {
                setIsSetup(ret);
            })

        Helpers.get<string>(`/api/setup-promise/${SettingKey.networkId}`)
            .then((ret: string) => {
                setNetworkId(ret);
            })

        Helpers.get<string>(`/api/setup-promise/${SettingKey.routerModel}`)
            .then((ret: string) => {
                setRouterModel(ret);
            })
    }, []);

    const tryPassword = () => {
        setShowPasswordResults(false);
        Helpers.post<boolean>(`/api/try-password`, { password: password })
            .then((ret: boolean) => {
                setPasswordIsGood(ret);
                setShowPasswordResults(true);
                if (!passwordIsGood) setPassword("");
            });
    }

    const saveSettingsAndReset = () => {
        Helpers.post<void>(`/api/save-and-restart`, {})
            .then(() => {
                //redirect
            });
    }

    return (
        <div>
            {isSetup ?
                <Stack direction="column">
                    <h1>Welcome to curfew setup page</h1>
                    <p>NetworkId: {networkId}</p>
                    <p>Router model: {routerModel}</p>
                <FormGroup>
                    <TextField
                        id="password"
                        label="router password"
                        helperText="the admin password for your router"
                        variant="standard"
                        value={password}
                        type="password"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setPassword(e.target.value);
                        }}
                    />

                    <Button onClick={tryPassword} >Try password</Button>

                    {showPasswordResults ?
                        (passwordIsGood 
                        ? 
                        <Stack direction="column">
                            <p style={{"color": "green"}}>Password is good!</p>
                            <Button onClick={saveSettingsAndReset} >
                                Save these settings and start curfew
                            </Button>
                        </Stack>
                        :
                        <p style={{"color": "red"}}>
                            Password is invalid - please try again
                        </p>)
                        :
                        <></>
                    }
                
                </FormGroup>
                </Stack>
                :
                <>
                    {props.children}
                </>
            }
        </div>
    )
}