import { useContext, useEffect, useState } from "react";
import { KeywordsList } from "./keywordsList";
import { IKeyword } from "./IKeyword";
import { Helpers } from "../helpers";
import { CurrentPage, PageContext } from "../pageSelector/pageSelector";
import { Button } from "@mui/joy";
import { Stack } from "@mui/material";


export function KeywordsPage() {
    let [ids, setIds] = useState<number[]>([]);
    let pageContext = useContext(PageContext);

    useEffect(() => {
        Helpers.get<IKeyword[]>(`/api/keywords/`)
            .then((keywords: IKeyword[]) => {
                setIds(keywords.map(k => k.id));
            });
    }, []);

    const deleteId = (id: number) => {
        Helpers.delete(`/api/keyword/` + id)
            .then((deleted: number) => {
                if (deleted > 0) {
                    let newIds = Helpers.removeAllFromArray(id, ids);
                    setIds(newIds);
                }
            })
    }

    const createId = () => {
        let newIds = ids.length;
        setIds(ids.concat(newIds));
    }

    return (
        <>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <h2>Keywords</h2>
                <Button onClick={() => {
                    pageContext.setParams({ createKeywordId: createId });
                    pageContext.goTo(CurrentPage.createKeyword);
                }} variant="soft" color="primary">
                    + Create
                </Button>
            </Stack>
            <KeywordsList ids={ids} onDelete={deleteId} />
        </>
    )
}