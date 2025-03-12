import { Express, Request, Response } from 'express';
import { RouterProvider } from '../router/routerProvider';
import { Setup } from './setup';
import { SettingKey } from '../settings/setting';


export class SetupApi {
    static init(app: Express, setup?: Setup) {
        
        app.get('/api/is-setup', async (req: Request, res: Response) => {
            res.status(200).json(setup != null);
        });
        
        //ONLY IF IN SETUP MODE
        if (setup) {

            app.get('/api/setup-promise/:settingKey', async (req: Request, res: Response) => {
                let settingKey = Number(req.params.settingKey);
                if ([SettingKey.networkId, SettingKey.routerModel].indexOf(settingKey) != -1) {
                    setup.savePromiseOrReturnValue(settingKey)
                        .then((value: string) => 
                            res.status(200).json(value)
                        );
                }
                else {
                    res.status(400).send("parameter error");
                }
            });
            
            // try to login to router with password
            //curl -i -X POST -H "Content-Type: application/json" -d "{\"password\":\"poo\"}"  http://localhost:5500/api/try-password
            app.post('/api/try-password', async (req: Request, res: Response) => {
                let password = req.body.password;
                if (password && password.length > 0) {
                    let router = await new RouterProvider(setup.options).savedRouter();
                    if (router == null) {
                        res.status(500).send("parameter error");
                        return;
                    }
                    let success = await router.isPasswordCorrect(password);
                    if (success) {
                        setup.password = password;
                    }
                    res.status(200).json(success);
                }
                else {
                    res.status(400).send("parameter error");
                }
            });
    
            //curl -i -X POST -H "Content-Type: application/json" -d "{}"  http://localhost:5500/api/save-and-restart
            app.post('/api/save-and-restart', async (req: Request, res: Response) => {
                await setup.save();
                res.status(200).json(null);
                process.exit();
            });
    
            app.post('/api/discard-and-restart', async (req: Request, res: Response) => {
                res.status(200).json(null);
                process.exit();
            });
        }
    }
}