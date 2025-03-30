import { Express, Request, Response } from 'express';
import { KeywordTimerAction, Timer } from './timer';
import { CurfewDb } from '../db';

export class TimerApi {
    static init(app: Express, db: CurfewDb) {
        let timer = new Timer(db);

        app.get('/api/timer/seconds-ahead', async (req: Request, res: Response) => {
            res.status(200).json(timer.secondsRemaining);
        });

        app.get('/api/timer/last-applied', async (req: Request, res: Response) => {
            res.status(200).json(timer.epochLastApplied);
        });

        app.post('/api/timer/seconds-ahead', async (req: Request, res: Response) => {
            let secondsAhead = Number(req.body.value);
            if (!isNaN(secondsAhead)) {
                timer.secondsRemaining = secondsAhead;
                res.status(200).json(true);
            }
            else {
                res.status(400).send("parameter error");
            }
        });

        app.get('/api/timer/action/:id', async (req: Request, res: Response) => {
            let keywordId = Number(req.params.id);
            if (keywordId > 0) {
                res.status(200).json(timer.getAction(keywordId));
            }
            else {
                res.status(400).send("parameter error");
            }
        });


        app.post('/api/timer/action/:id', async (req: Request, res: Response) => {
            let keywordId = Number(req.params.id);
            let action = req.body.action == null ? Number(req.body.action) : KeywordTimerAction.None;
            if (keywordId > 0 && Object.values(KeywordTimerAction).includes(action)) {
                timer.setAction(keywordId, action);
                res.status(200).json(true);
            }
            else {
                res.status(400).send("parameter error");
            }
        });
    }
}