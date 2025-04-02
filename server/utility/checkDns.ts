import { createSocket } from "dgram";

export function checkDns(): Promise<void> {
    let port: number = Number(process.env.DNS_PORT);
    if (Number(process.env.DNS_ENABLED) != 1) {
        return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
        let socket = createSocket('udp4');
        socket.on("error", () => reject());
        socket.on("listening", () => {
            socket.close();
            resolve();
        })
        socket.bind(port);
    })
    .catch(() => { throw(`! DNS port ${port} already in use !`) });
}