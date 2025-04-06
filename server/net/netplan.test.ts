const test = require('node:test');
import { NetPlan } from "./netplan";

test('sets static ip', async () => {
    await NetPlan.setStaticIp({
        network: "192.168.0",
        thisHost: "39",
        dns: "1.1.1.1"
    })
})
