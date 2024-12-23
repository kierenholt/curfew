import express, { Express, Request, Response } from 'express';
import { SettingApi } from './settings/settingApi';
import { DnsResponseApi } from './dnsResponse/dnsResponseApi';
import { KeywordApi } from './keyword/keywordApi';
import { ProgressApi } from './progress/progressApi';
const nocache = require("nocache");

export class API {
    static start() {
        const http: Express = express();

        http.use(nocache());
        http.use(express.json()); // to support JSON-encoded bodies
        //app.use(cors); //breaks everything do not use
        //app.use(express.urlencoded()); // to support URL-encoded bodies

        const port: number = Number(process.env.API_PORT);
        const INADDR_ANY = "0.0.0.0"; //https://nodejs.org/dist/latest-v4.x/docs/api/http.html#http_server_listen_port_hostname_backlog_callback

        SettingApi.init(http);
        DnsResponseApi.init(http);
        KeywordApi.init(http);
        ProgressApi.init(http);
        
        http.listen(port, INADDR_ANY, () => {
            console.log(`✓ Server is listening at http://localhost:${port}`);
        });
    }
}
