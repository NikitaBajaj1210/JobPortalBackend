// // logger.middleware.ts

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { winstonLogger } from './winston-logger';


@Injectable() export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, body, headers } = req; const userAgent = headers['user-agent'] || 'unknown';

        // Log Request
        winstonLogger.info(`${method} ${originalUrl} - UA: ${userAgent}`);

        // Attach error handler to response
        const originalSend = res.send;
        res.send = function (body?: any): Response {
            if (res.statusCode >= 400) {
                const isProd = process.env.NODE_ENV === 'production';
                const responseBodyLog = isProd ? "[Error Response Body Not Logged in Production]" : JSON.stringify(body);
                winstonLogger.error(`Error ${res.statusCode} on ${method} ${originalUrl} - Body: ${responseBodyLog}`);
            }
            return originalSend.call(this, body);
        };
        next();
    }
}

