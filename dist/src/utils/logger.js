// src/utils/logger.ts
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "ERROR";
    LogLevel["WARN"] = "WARN";
    LogLevel["INFO"] = "INFO";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (LogLevel = {}));
class Logger {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }
    formatLog(level, message, data, req) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            userId: req?.user?._id,
            ip: req?.ip,
        };
    }
    log(level, message, data, req) {
        const logEntry = this.formatLog(level, message, data, req);
        if (this.isDevelopment) {
            console.log(`[${logEntry.timestamp}] ${level}: ${message}`, data || '');
        }
        else {
            // Production'da JSON formatında log
            console.log(JSON.stringify(logEntry));
        }
    }
    error(message, data, req) {
        this.log(LogLevel.ERROR, message, data, req);
    }
    warn(message, data, req) {
        this.log(LogLevel.WARN, message, data, req);
    }
    info(message, data, req) {
        this.log(LogLevel.INFO, message, data, req);
    }
    debug(message, data, req) {
        if (this.isDevelopment) {
            this.log(LogLevel.DEBUG, message, data, req);
        }
    }
}
export const logger = new Logger();
