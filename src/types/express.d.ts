// src/types/express.d.ts

import { Request } from 'express';
import { HydratedUserDocument } from './userTypes.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: HydratedUserDocument;
  }
}

declare module 'iyzipay';

export interface UserRequest extends Request {
  user?: HydratedUserDocument;
}

