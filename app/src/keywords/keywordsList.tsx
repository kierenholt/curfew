import { List } from "@mui/joy";
import { KeywordListItem } from "./keywordsListItem";

export interface KeywordsListProps {
    ids: number[];
}

export function KeywordsList(props: KeywordsListProps) {

    //https://github.com/kierenholt/curfew/blob/groups-users-requests-full-db/app/src/QuotaEditForm.tsx

    return (
        <List>
            {props.ids.map((g: number) =>
                <KeywordListItem key={g} id={g} />
            )}
        </List>
    )
}