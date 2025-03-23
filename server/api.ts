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
        let wwwPath = path.join(__dirname, 'app');
        let indexPath = path.join(wwwPath, "index.html");
        let certPath = path.join(__dirname, 'cert');
        let localKeyPath = path.join(certPath, 'localhost_key.pem')
        let localCertPath = path.join(certPath, 'localhost_cert.pem');

        if (Number(process.env.USE_REACT_DEV_SERVER) == 0 && !fs.existsSync(indexPath)) {
            throw("wwwroot/index.html not found. please read readme.md");
        }

        if (!fs.existsSync(localKeyPath) || !fs.existsSync(localCertPath)) {
            throw("certificate not found. please read readme.md");
        }

        let options = {
            key: fs.readFileSync(localKeyPath),
            cert: fs.readFileSync(localCertPath)
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
        
        if (Number(process.env.USE_REACT_DEV_SERVER) == 0) {
            //https://medium.com/@amasaabubakar/how-you-can-serve-react-js-build-folder-from-an-express-end-point-127e236e4d67
            app.get("*", (req: Request, res: Response) => {
                res.sendFile(indexPath);
            })
        }
        
        http.createServer(app).listen(process.env.HTTP_PORT, () => {
            console.log(`✓ Server is listening at http://localhost:${process.env.HTTP_PORT}`);
        });

        https.createServer(options, app).listen(process.env.HTTPS_PORT, () => {
            console.log(`✓ Server is listening at https://localhost:${process.env.HTTPS_PORT}`);
        });
    }
}
