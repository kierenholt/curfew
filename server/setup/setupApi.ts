import { Express, Request, Response } from 'express';
import { RouterProvider } from '../router/routerProvider';
import { Setup } from './setup';


export class SetupApi {
    static init(app: Express, setup: Setup) {
        console.log(". starting setup API");
        
        // try to login with password
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

        app.post('/api/save-and-restart', async (req: Request, res: Response) => {
            await setup.save();
            process.exit();
        });

        app.post('/api/discard-and-restart', async (req: Request, res: Response) => {
            process.exit();
        });
    }
}