import { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../services/apiKeyService';
import type { ApiKeyType } from '../types/auth';

/**
 * Middleware to require API key authentication
 */
export function requireApiKey(allowedTypes?: ApiKeyType[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract API key from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing Authorization header',
        });
        return;
      }

      // Expect format: "Bearer <api_key>"
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid Authorization header format. Expected: Bearer <api_key>',
        });
        return;
      }

      const apiKey = parts[1];

      // Validate the API key
      const metadata = await validateApiKey(apiKey);

      if (!metadata) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired API key',
        });
        return;
      }

      // Check if key type is allowed for this endpoint
      if (allowedTypes && !allowedTypes.includes(metadata.type)) {
        res.status(403).json({
          error: 'Forbidden',
          message: `This endpoint requires ${allowedTypes.join(' or ')} access`,
        });
        return;
      }

      // Attach auth context to request
      req.auth = {
        apiKey,
        keyType: metadata.type,
        keyName: metadata.name,
      };

      console.log(`[Auth] Request from: ${metadata.name} (${metadata.type})`);
      next();
    } catch (error) {
      console.error('[Auth] Error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication error',
      });
    }
  };
}

/**
 * Middleware to optionally authenticate (doesn't require auth but attaches if present)
 */
export function optionalApiKey() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        next();
        return;
      }

      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const apiKey = parts[1];
        const metadata = await validateApiKey(apiKey);

        if (metadata) {
          req.auth = {
            apiKey,
            keyType: metadata.type,
            keyName: metadata.name,
          };
        }
      }

      next();
    } catch (error) {
      console.error('[Auth] Optional auth error:', error);
      next();
    }
  };
}
