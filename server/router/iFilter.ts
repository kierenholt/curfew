import { OidType } from "./virginOids";


export interface IFilter {
    oidsAndValues(): Promise<[OidType[], string[], string]>;
}