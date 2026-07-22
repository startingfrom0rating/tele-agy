export function isUserAllowed(incomingUserId, allowedUserId) {
  if (!incomingUserId || !allowedUserId) return false;
  return Number(incomingUserId) === Number(allowedUserId);
}

export function createAuthMiddleware(allowedUserId) {
  return async (ctx, next) => {
    const fromId = ctx.from?.id;
    if (!isUserAllowed(fromId, allowedUserId)) {
      console.warn(`[Security Alert] Unauthorized access attempt from User ID: ${fromId}`);
      if (ctx.message || ctx.callbackQuery) {
        await ctx.reply('⛔ Unauthorized access. Access denied.').catch(() => {});
      }
      return;
    }
    return next();
  };
}
