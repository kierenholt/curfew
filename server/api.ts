import express, { Express, Request, Response } from 'express';
import { SettingApi } from './settings/settingApi';
import { DnsResponseApi } from './dns/dnsResponseApi';
import { KeywordApi } from './keyword/keywordApi';
const nocache = require("nocache");

export class API {
    static init() {
        const app: Express = express();

        app.use(nocache());
        app.use(express.json()); // to support JSON-encoded bodies
        //app.use(cors); //breaks everything do not use
        //app.use(express.urlencoded()); // to support URL-encoded bodies
        app.use(express.static(process.env.APP_PATH as string)); //to serve static files

        const port: number = Number(process.env.API_PORT);
        const INADDR_ANY = "0.0.0.0"; //https://nodejs.org/dist/latest-v4.x/docs/api/http.html#http_server_listen_port_hostname_backlog_callback

        SettingApi.init(app);
        DnsResponseApi.init(app);
        KeywordApi.init(app);

        //https://medium.com/@amasaabubakar/how-you-can-serve-react-js-build-folder-from-an-express-end-point-127e236e4d67
        app.get("*", (req, res) => {
            res.sendFile(process.env.APP_PATH as string & "/index.html");
        })

        app.listen(port, INADDR_ANY, () => {
            console.log(`✓ Server is listening at http://localhost:${port}`);
        });
    }
}
