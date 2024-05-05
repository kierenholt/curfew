import { Answer } from "./answer";

export interface HasKey {
    cacheKey: string;
}

export class Cache {
    cached: any = {};

    getAnswers(hasKey: HasKey): Answer[] {
        return this.cached[hasKey.cacheKey];
    }

    upsert(hasKey: HasKey, answers: Answer[]) {
        this.cached[hasKey.cacheKey] = answers;
    }
}