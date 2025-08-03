// src/utils/logger.ts

enum LogLevel {
    ERROR = 'ERROR',
    WARN = 'WARN',
    INFO = 'INFO',
    DEBUG = 'DEBUG',
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: any;
    userId?: string;
    ip?: string;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';

    private formatLog(level: LogLevel, message: string, data?: any, req?: any): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            userId: req?.user?._id,
            ip: req?.ip,
        };
    }

    private log(level: LogLevel, message: string, data?: any, req?: any): void {
        const logEntry = this.formatLog(level, message, data, req);

        if (this.isDevelopment) {
            console.log(`[${logEntry.timestamp}] ${level}: ${message}`, data || '');
        } else {
            // Production'da JSON formatında log
            console.log(JSON.stringify(logEntry));
        }
    }

    error(message: string, data?: any, req?: any): void {
        this.log(LogLevel.ERROR, message, data, req);
    }

    warn(message: string, data?: any, req?: any): void {
        this.log(LogLevel.WARN, message, data, req);
    }

    info(message: string, data?: any, req?: any): void {
        this.log(LogLevel.INFO, message, data, req);
    }

    debug(message: string, data?: any, req?: any): void {
        if (this.isDevelopment) {
            this.log(LogLevel.DEBUG, message, data, req);
        }
    }
}

export const logger = new Logger(); 