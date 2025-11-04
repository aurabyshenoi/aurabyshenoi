import fs from 'fs';
import path from 'path';

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  metadata?: any;
  stack?: string;
}

class Logger {
  private logLevel: LogLevel;
  private logDir: string;
  private enableConsole: boolean;
  private enableFile: boolean;

  constructor() {
    this.logLevel = this.getLogLevel();
    this.logDir = path.join(process.cwd(), 'logs');
    this.enableConsole = process.env.NODE_ENV !== 'production';
    this.enableFile = true;

    // Create logs directory if it doesn't exist
    this.ensureLogDirectory();
  }

  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    switch (level) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      default: return LogLevel.INFO;
    }
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLogEntry(level: string, message: string, metadata?: any, stack?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      stack,
    };
  }

  private writeToFile(logEntry: LogEntry): void {
    if (!this.enableFile) return;

    const logLine = JSON.stringify(logEntry) + '\n';
    const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);

    try {
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private writeToConsole(logEntry: LogEntry): void {
    if (!this.enableConsole) return;

    const { timestamp, level, message, metadata } = logEntry;
    const coloredLevel = this.colorizeLevel(level);
    
    let output = `${timestamp} [${coloredLevel}] ${message}`;
    
    if (metadata) {
      output += ` ${JSON.stringify(metadata)}`;
    }

    if (logEntry.stack) {
      output += `\n${logEntry.stack}`;
    }

    console.log(output);
  }

  private colorizeLevel(level: string): string {
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[35m', // Magenta
    };
    const reset = '\x1b[0m';
    
    return `${colors[level as keyof typeof colors] || ''}${level}${reset}`;
  }

  private log(level: LogLevel, levelName: string, message: string, metadata?: any, error?: Error): void {
    if (level > this.logLevel) return;

    const logEntry = this.formatLogEntry(
      levelName,
      message,
      metadata,
      error?.stack
    );

    this.writeToConsole(logEntry);
    this.writeToFile(logEntry);
  }

  error(message: string, error?: Error, metadata?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, metadata, error);
  }

  warn(message: string, metadata?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, metadata);
  }

  info(message: string, metadata?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, metadata);
  }

  debug(message: string, metadata?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, metadata);
  }

  // Performance logging
  startTimer(label: string): () => void {
    const start = process.hrtime.bigint();
    
    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds
      this.info(`Timer: ${label}`, { duration: `${duration.toFixed(2)}ms` });
    };
  }

  // Request logging middleware
  requestLogger() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();
      const { method, url, ip } = req;

      res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        
        const logLevel = statusCode >= 400 ? 'warn' : 'info';
        this[logLevel as 'info' | 'warn'](`${method} ${url}`, {
          statusCode,
          duration: `${duration}ms`,
          ip,
          userAgent: req.get('User-Agent'),
        });
      });

      next();
    };
  }

  // Error logging middleware
  errorLogger() {
    return (error: Error, req: any, res: any, next: any) => {
      this.error(`Unhandled error in ${req.method} ${req.url}`, error, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        params: req.params,
        query: req.query,
      });

      next(error);
    };
  }

  // Cleanup old log files (keep last 30 days)
  cleanupOldLogs(): void {
    try {
      const files = fs.readdirSync(this.logDir);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      files.forEach(file => {
        if (file.endsWith('.log')) {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < thirtyDaysAgo) {
            fs.unlinkSync(filePath);
            this.info(`Cleaned up old log file: ${file}`);
          }
        }
      });
    } catch (error) {
      this.error('Failed to cleanup old logs', error as Error);
    }
  }
}

// Create singleton instance
export const logger = new Logger();

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', new Error(String(reason)), { promise });
});

// Cleanup logs on startup
logger.cleanupOldLogs();

export default logger;