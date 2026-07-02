import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { requestLogger } from '../middleware/requestLogger.js';

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    method: 'GET',
    path: '/api/queues',
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test-agent' },
    ...overrides,
  } as unknown as Request;
}

function makeRes(statusCode = 200) {
  const listeners: Record<string, (() => void)[]> = {};
  return {
    statusCode,
    on: (event: string, cb: () => void) => {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(cb);
    },
    emit: (event: string) => {
      (listeners[event] ?? []).forEach((cb) => cb());
    },
  } as unknown as Response & { emit: (e: string) => void };
}

describe('requestLogger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('calls next()', () => {
    const next = vi.fn() as unknown as NextFunction;
    const res = makeRes();
    requestLogger(makeReq(), res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('logs INFO for 2xx responses on finish', () => {
    const next = vi.fn() as unknown as NextFunction;
    const res = makeRes(200);
    requestLogger(makeReq(), res, next);
    res.emit('finish');
    expect(consoleSpy).toHaveBeenCalledOnce();
    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.level).toBe('INFO');
    expect(logged.status).toBe(200);
    expect(logged.method).toBe('GET');
  });

  it('logs WARN for 4xx responses', () => {
    const next = vi.fn() as unknown as NextFunction;
    const res = makeRes(404);
    requestLogger(makeReq(), res, next);
    res.emit('finish');
    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.level).toBe('WARN');
  });

  it('logs ERROR for 5xx responses', () => {
    const next = vi.fn() as unknown as NextFunction;
    const res = makeRes(500);
    requestLogger(makeReq(), res, next);
    res.emit('finish');
    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.level).toBe('ERROR');
  });
});
