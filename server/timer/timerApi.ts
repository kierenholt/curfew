import { Express, Request, Response } from 'express';
import { KeywordTimerAction, Timer } from './timer';
import { CurfewDb } from '../db';

export class TimerApi {
    static init(app: Express, db: CurfewDb) {
        let timer = new Timer(db);

        app.get('/api/timer/secondsAhead', async (req: Request, res: Response) => {
            res.status(200).json(timer.secondsRemaining);
        });

        app.post('/api/timer/set/:secondsAhead', async (req: Request, res: Response) => {
            let secondsAhead = Number(req.params.secondsAhead);
            if (secondsAhead > 0) {
                timer.secondsRemaining = secondsAhead;
                res.status(200);
            }
        });

        app.get('/api/timer/action/:id', async (req: Request, res: Response) => {
            let keywordId = Number(req.params.id);
            if (keywordId > 0) {
                res.status(200).json(timer.getAction(keywordId));
            }
        });

        app.post('/api/timer/block/:keywordId', async (req: Request, res: Response) => {
            let keywordId = Number(req.params.keywordId);
            if (keywordId > 0) {
                timer.setAction(keywordId, KeywordTimerAction.Block);
                res.status(200);
            }
        });

        app.post('/api/timer/allow/:keywordId', async (req: Request, res: Response) => {
            let keywordId = Number(req.params.keywordId);
            if (keywordId > 0) {
                timer.setAction(keywordId, KeywordTimerAction.Allow);
                res.status(200);
            }
        });

        app.post('/api/timer/no-action/:keywordId', async (req: Request, res: Response) => {
            let keywordId = Number(req.params.keywordId);
            if (keywordId > 0) {
                timer.setAction(keywordId, KeywordTimerAction.None);
                res.status(200);
            }
        });
    }
}