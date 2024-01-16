import { createParamDecorator } from '@nestjs/common';
import { Users } from '../models/user.entity';

export const GetUser = createParamDecorator((data, req): Users => {
  //console.log(req.args[0].user);
  return req.args[0].user;
});
