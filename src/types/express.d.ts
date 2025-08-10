// src/types/express.d.ts

import { Request } from 'express';

interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload;
  }
}

declare module 'iyzipay';

export interface UserRequest extends Request {
  user?: UserPayload;
}