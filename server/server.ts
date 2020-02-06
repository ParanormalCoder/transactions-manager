import http from 'http';
import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';

import dotenv from 'dotenv';
dotenv.config();

import authRouter from './modules/auth/router';
import requestsRouter from './modules/requests/router';
import transactionRouter from './modules/transactions/router';

import mongo from './common/mongo';
import mysql from './common/mysql';
import { RequestsService } from './modules/requests/service';

const app: Koa = new Koa();
const PORT = 5000;

app.use(bodyParser());
app.use(cors());

app.use(async (ctx: Koa.Context, next: () => Promise<any>) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.info(`${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(async (ctx: Koa.Context, next: () => Promise<any>) => {
  const start = Date.now();
  await next();
  await RequestsService.addOne(ctx.request.href, ctx.body, ctx.status);
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

const server = http.createServer(app.callback());

// Route middleware.
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());
app.use(requestsRouter.routes());
app.use(requestsRouter.allowedMethods());
app.use(transactionRouter.routes());
app.use(transactionRouter.allowedMethods());

if (process.env && process.env.NODE_ENV !== 'test') {
  Promise.all([
    mongo.connect(),
    Object.keys(mysql.models).map(modelName => mysql.models[modelName].sync())
  ]).then(() => {
    app
      .listen(PORT, () => {
        console.info(`Server started on port ${PORT}`);
      })
      .on('error', err => {
        console.error(err);
      });
  });
}

export default server;
