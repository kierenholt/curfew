import { useEffect, useState } from "react";
import { KeywordsList } from "./keywordsList";
import { IKeyword } from "./IKeyword";
import { Helpers } from "../helpers";


export function KeywordsPage() {
    let [ids, setIds] = useState<number[]>([]);

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

    return (
        <>
            <h2>Keywords</h2>
            <KeywordsList ids={ids} onDelete={deleteId}/>
        </>
    )
}