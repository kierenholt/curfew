import { useContext, useEffect, useState } from "react";
import { KeywordsList } from "./keywordsList";
import { IKeyword } from "./IKeyword";
import { Helpers } from "../helpers";
import { CurrentPage, PageContext } from "../pageSelector/pageSelector";
import { Button } from "@mui/joy";
import { Stack } from "@mui/material";
import { ProgressContext } from "../progress/progressModalContainer";


export function KeywordsPage() {
    let [ids, setIds] = useState<number[]>([]);
    let pageContext = useContext(PageContext);
    const progressContext = useContext(ProgressContext);

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

    const blockAllowAll = (handle: string) => {
        let nonce: number = Helpers.createNonce();
        Helpers.put<number>(`/api/keywords/${handle}`,
            {
                nonce: nonce
            })
            .then((updated: number) => {
                if (updated > 0) {
                    progressContext.setNonce(nonce);
                    progressContext.setOnSuccess(() => {
                        setTimeout(() => window.location.href = window.location.href, 2000);
                    });
                    progressContext.setOpen(true);
                }
                else {
                    throw ("error communicating with server");
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
                <h2>App blocking</h2>
                <Button onClick={() => {
                    pageContext.setParams({ createKeywordId: createId });
                    pageContext.goTo(CurrentPage.createKeyword);
                }} variant="soft" color="primary">
                    + Create new block
                </Button>
            </Stack>
            <KeywordsList ids={ids} onDelete={deleteId} />
            <Stack direction="row" justifyContent="left" spacing={1} alignItems="baseline">
                <Button onClick={() => blockAllowAll("allow")} variant="soft" color="primary">
                    Allow all
                </Button>
                <Button onClick={() => blockAllowAll("block")} variant="soft" color="primary">
                    Block all
                </Button>
            </Stack>
        </>
    )
}