import { Express, Request, Response } from 'express';
import { Progress } from './progress';
import { IProgressMessage } from './IProgressMessage';

export class ProgressApi {
    static init(app: Express) {

        app.get('/api/progress/:nonce', async (req: Request, res: Response) => {
            let nonce = Number(req.params.nonce);
            if (nonce > 0) {
                let ret: IProgressMessage = await Progress.getMessage(nonce);
                res.status(200).json(ret);
            }
        });
    }
}