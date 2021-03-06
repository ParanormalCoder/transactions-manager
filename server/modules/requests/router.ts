import Koa from 'koa';
import Router from 'koa-router';
import koaJwt from '../../common/KoaJwt';
import { RequestsRepository } from './repository';

const routerOpts: Router.IRouterOptions = {
  prefix: '/requests'
};

const router: Router = new Router(routerOpts);

router.get('/', koaJwt, async (ctx: Koa.Context) => {
  const requests = await RequestsRepository.getAll();
  ctx.body = {
    data: requests
  };
});

export default router;
