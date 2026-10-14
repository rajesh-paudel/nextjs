import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    // If a specific key was passed (e.g. @GetUser('userId')), return just that property
    if (data) {
      return user?.[data];
    }

    //  Otherwise, return the entire user object
    return user;
  },
);
