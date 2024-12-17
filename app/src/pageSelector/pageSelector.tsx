import { createContext, useState } from 'react';
import { KeywordsPage } from '../keywords/keywordsPage';
import { EditKeyword } from '../keywords/editKeyword';
import { ManageSettingsPage } from '../settings/settingsPage';
import { EditSettingPage } from '../settings/editSettingPage';
import { SettingsOrHomeButton } from '../navigation/settingsButton';

export enum CurrentPage {
    keywords = 0,
    editKeyword = 1,
    manageSettings = 2,
    editSetting = 3
}

interface SetPageAction {
    goTo: (p: CurrentPage) => void;
    setParams: (p: any) => void;
    goBack: () => void;
    current: CurrentPage;
}

export const PageContext = createContext<SetPageAction>(
    { goTo: () => { }, setParams: () => { }, goBack: () => { }, current: CurrentPage.keywords }
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
            },
            current: current
        }}>
            <div style={{ display: "flex" }}>
                <SettingsOrHomeButton />
            </div>
            {
                [
                    <KeywordsPage />,
                    <EditKeyword onEdited={() => setCurrent(prev)}
                        initialValues={params.keyword}
                        updateKeyword={params.updateKeyword} />,
                    <ManageSettingsPage />,
                    <EditSettingPage settingKey={Number(params.key)} />
                ][current]
            }
        </PageContext.Provider>
    );
} 