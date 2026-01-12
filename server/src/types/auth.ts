export type ApiKeyType = 'admin' | 'tester';

export interface ApiKeyMetadata {
  name: string;
  type: ApiKeyType;
  createdAt: number;
  lastUsed: number;
  rateLimit: number;
  enabled: boolean;
  expiresAt?: number;
}

export interface AuthContext {
  apiKey: string;
  keyType: ApiKeyType;
  keyName: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}
