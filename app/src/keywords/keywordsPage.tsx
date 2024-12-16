import { useEffect, useState } from "react";
import { KeywordsList } from "./keywordsList";
import { IKeyword } from "../types";
import { Helpers } from "../helpers";


export function KeywordsPage() {
    let [ids, setIds] = useState<number[]>([]);

    useEffect(() => {
        Helpers.get<IKeyword[]>(`/api/keywords/`)
            .then((keywords: IKeyword[]) => {
                setIds(keywords.map(k => k.id));
            });
    }, []);

    return (
        <>
            <h2>Keywords</h2>
            <KeywordsList ids={ids} />
        </>
    )
}