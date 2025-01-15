import { OidType } from "./virginOids";


export interface IFilter {
    oidsAndValues(): [OidType[], string[], string];
}