import express, { Express, Request, Response } from 'express';

export class HttpServer {
    static init() {
        const app: Express = express();
        app.use(express.json());       // to support JSON-encoded bodies
        app.use(express.urlencoded()); // to support URL-encoded bodies

        const port = 80;
        
        app.get('/', (req: Request, res: Response) => {
          res.setHeader("Content-Type", "text/html");
          res.writeHead(200);
          res.end(`
          <html>
          <head>
              <meta http-equiv="refresh" content="5">
              <style></style>
          </head>
          <body>
            welcome to curfew
          </body>
          </html>`);
        });
        

        app.post('/', (req: Request, res: Response) => {
            console.log("post");
            }
        );

        app.listen(port, () => {
            console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
        });
    }
}
