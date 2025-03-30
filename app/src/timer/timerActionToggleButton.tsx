import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { KeywordTimerAction } from './keywordTimerAction';
import { useEffect, useState } from 'react';
import { Helpers } from '../helpers';

export interface TimerActionToggleButtonProps {
    id: number;
}

export const TimerActionToggleButton = (props: TimerActionToggleButtonProps) => {
    let [action, setAction] = useState<KeywordTimerAction>(KeywordTimerAction.None);

    useEffect(() => {
        Helpers.get<KeywordTimerAction>(`/api/timer/action/${props.id}`)
            .then((action: KeywordTimerAction) => {
                setAction(action); //also sends null if de-selected 
            })

    }, [props.id])

    const onChange = (event: any, actionValue: KeywordTimerAction) => {
        Helpers.post(`/api/timer/action/${props.id}`, { action: actionValue })
            .then((success: boolean) => {
                if (success) {
                    setAction(actionValue);
                    console.log(actionValue);
                }
            });
    }

    return (
        <ToggleButtonGroup
            color="primary"
            value={action}
            exclusive
            onChange={onChange}
        >
            <ToggleButton value={KeywordTimerAction.Block}>Block</ToggleButton>
            <ToggleButton value={KeywordTimerAction.Allow}>Allow</ToggleButton>
        </ToggleButtonGroup>
    );
}