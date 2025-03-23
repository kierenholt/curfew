import { RouterBase } from "./routerBase";
import { TestHappyRouter as MockRouter } from "./testRouter/testHappyRouter";
import { VirginRouter } from "./virgin/virginRouter";

export enum ModelName {
    VirginHub3 = "Virgin Hub 3",
    TestRouter = "Test",
    None = "",
}

export interface RouterOptions {
    password: string,
    routerIp: string,
    fullNetwork: string,
    name: string,
}

export class RouterProvider {
    options: RouterOptions;

    constructor(options: RouterOptions) {
        this.options = options;
    }

    async savedRouter(): Promise<RouterBase | null> {
        if (Number(process.env.MOCK_ROUTER) == 1) {
            return new MockRouter();
        }
        let name = await this.options.name;
        if (name == ModelName.VirginHub3) {
            return new VirginRouter(this.options);
        }
        return null;
    }

    async identifyRouter(): Promise<string> {
        if (Number(process.env.MOCK_ROUTER) == 1) {
            return ModelName.TestRouter;
        }
        let virginRouter = new VirginRouter(this.options);
        if (await virginRouter.hasLoginPage()) {
            return ModelName.VirginHub3;
        }
        return ModelName.None;
    }
}