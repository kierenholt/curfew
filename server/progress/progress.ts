import { IProgressMessage } from "./IProgressMessage";

export class Progress {
    static instances: { [i: number]: IProgressMessage } = {};

    static update(nonce: number, isSuccess: boolean, message: string) {
        this.instances[nonce] = { message: message, isSuccess: isSuccess }
    }

    static getMessage(nonce: number): IProgressMessage {
        return this.instances[nonce];
    }
}