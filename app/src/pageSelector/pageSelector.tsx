import { createContext, useState } from 'react';
import { KeywordsPage } from '../keywords/keywordsPage';
import { EditKeyword } from '../keywords/editKeyword';

export enum CurrentPage {
    keywords = 0,
    editKeyword = 1,
}

interface SetPageAction {
    goTo: (p: CurrentPage) => void,
    setParams: (p: any) => void,
    goBack: () => void
}

export const PageContext = createContext<SetPageAction>(
    { goTo: () => { }, setParams: () => { }, goBack: () => { } }
);

export const PageSelector = () => {
    //default page
    const [current, setCurrent] = useState<CurrentPage>(CurrentPage.keywords);
    const [params, setParams] = useState<any>({});
    const [prev, setPrev] = useState<CurrentPage>(CurrentPage.keywords);

    return (
        <PageContext.Provider value={{
            goTo: (value: CurrentPage) => {
                setPrev(current);
                setCurrent(value);
            },
            setParams: setParams,
            goBack: () => {
                setCurrent(prev);
            }
        }}>
            {
                [
                    <KeywordsPage />,
                    <EditKeyword onEdited={() => setCurrent(prev)} initialValues={params.keyword} updateKeyword={params.updateKeyword} />,
                ][current]
            }
        </PageContext.Provider>
    );
} 