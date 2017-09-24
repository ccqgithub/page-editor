/**
 * 中间件：判断用户角色
 */

module.exports = function(roles=[]) {
  return async (ctx, next) => {
    if (
      !ctx.session.user
      || roles.indexOf(ctx.session.user.role) == -1
    ) {
      ctx.throw('没有权限', 403);
    }

    return next();
  }
}
