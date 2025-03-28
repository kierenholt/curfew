import { CurfewDb } from "../db";
import { Progress } from "../progress/progress";
import { RouterProvider } from "../router/routerProvider";
import { SettingKey } from "../settings/setting";

export enum KeywordTimerAction {
    None = 0,
    Block = 1,
    Allow = 2,
}

export class Timer {
    secondsRemaining: number = -1;
    timeout: NodeJS.Timeout;
    keywordActions: any = {};
    db: CurfewDb;

    constructor(db: CurfewDb) {
        this.timeout = setInterval(this.checkIsExpired.bind(this), 1000);
        this.db = db;
    }

    checkIsExpired() {
        if (this.secondsRemaining > -1) {
            this.secondsRemaining--;
            if (this.secondsRemaining < 0) {
                this.applyActions(0);
            }
        }
    }

    setAction(keywordId: number, action: KeywordTimerAction) {
        this.keywordActions[keywordId] = action;
    }

    getAction(keywordId: number): KeywordTimerAction {
        return this.keywordActions[keywordId] ?? KeywordTimerAction.None;
    }

    async applyActions(nonce: number): Promise<void> 
    {
        for (let id in this.keywordActions) {
            if (Number(id) > 0) {
                let action = this.keywordActions[id];
                if (action == KeywordTimerAction.Allow) {
                    this.db.keywordQuery.setIsActive(Number(id), 0);
                }
                if (action == KeywordTimerAction.Block) {
                    this.db.keywordQuery.setIsActive(Number(id), 1);
                }
                let router = await new RouterProvider(await this.db.settingQuery.getRouterOptions())
                    .savedRouter(await this.db.settingQuery.getString(SettingKey.routerModel));
                if (router == null) {
                    console.error("router not found");
                }
                else {
                    this.db.getAllBlockedIPsAndPorts()
                        .then((ipsAndPorts) =>
                            router?.applyBlockedIPsAndPorts(ipsAndPorts,
                                    (message: string, isSuccess: boolean) => Progress.update(nonce, isSuccess, message),
                                ));
                }
            }
        }
    }
}