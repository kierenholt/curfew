

export class Helpers {
    static sum(arr: number[]) {
        return arr.reduce((partialSum: any, a: any) => partialSum + a, 0);
    }
}