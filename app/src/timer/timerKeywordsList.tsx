import { List } from "@mui/joy";
import { TimerKeywordListItem } from "./timerKeywordListItem";

export interface TimerKeywordsListProps {
    ids: number[];
}

export function TimerKeywordsList(props: TimerKeywordsListProps) {

    //https://github.com/kierenholt/curfew/blob/groups-users-requests-full-db/app/src/QuotaEditForm.tsx

    return (
        <List>
            {props.ids.map((g: number) =>
                <TimerKeywordListItem key={g} id={g}/>
            )}
        </List>
    )
}