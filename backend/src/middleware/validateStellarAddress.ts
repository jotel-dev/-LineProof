/**
 * Express middleware that validates Stellar public key fields in request bodies.
 * Fields to validate are configured via the `fields` option.
 */
import type { Request, Response, NextFunction } from 'express';

const STELLAR_PUBLIC_KEY_RE = /^G[A-Z2-7]{55}$/;

export function validateStellarAddress(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of fields) {
      const value = (req.body as Record<string, unknown>)[field];
      if (value === undefined) continue; // optional field – skip
      if (typeof value !== 'string' || !STELLAR_PUBLIC_KEY_RE.test(value)) {
        return res.status(400).json({
          error: {
            message: `Invalid Stellar address for field "${field}". Must be a 56-character G-prefixed key.`,
            status: 400,
            field,
          },
        });
      }
    }
    next();
  };
}
