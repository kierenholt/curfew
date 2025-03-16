import express, { Request, Response } from 'express';
import { SettingApi } from './settings/settingApi';
import { DnsResponseApi } from './dnsResponse/dnsResponseApi';
import { KeywordApi } from './keyword/keywordApi';
import { ProgressApi } from './progress/progressApi';
import { CurfewDb } from './db';
import * as fs from 'fs';
import { SetupApi } from './setup/setupApi';
import { Setup } from './setup/setup';
import path from 'path';

const nocache = require("nocache");
var https = require('https');
var http = require('http');
var app = express();

export class API {
    static start(db: CurfewDb, setup?: Setup) {
        let wwwPath = path.join(__dirname, 'wwwroot');
        let certPath = path.join(__dirname, 'cert');

        let options = {
            key: fs.readFileSync(path.join(certPath, 'localhost_key.pem')),
            cert: fs.readFileSync(path.join(certPath, 'localhost_cert.pem'))
        };
        
        app.use(nocache());
        app.use(express.json()); // to support JSON-encoded bodies
        
        app.use(express.static(wwwPath))
        //app.use(cors); //breaks everything do not use
        //app.use(express.urlencoded()); // to support URL-encoded bodies
        
        SettingApi.init(app, db);
        SetupApi.init(app, setup);
        DnsResponseApi.init(app, db);
        KeywordApi.init(app, db);
        ProgressApi.init(app);
        
        //https://medium.com/@amasaabubakar/how-you-can-serve-react-js-build-folder-from-an-express-end-point-127e236e4d67
        app.get("*", (req: Request, res: Response) => {
            res.sendFile(path.join(wwwPath, "index.html"));
        })
        
        http.createServer(app).listen(process.env.HTTP_PORT, () => {
            console.log(`✓ Server is listening at http://localhost:${process.env.HTTP_PORT}`);
        });

        https.createServer(options, app).listen(process.env.HTTPS_PORT, () => {
            console.log(`✓ Server is listening at https://localhost:${process.env.HTTPS_PORT}`);
        });
    }
}
