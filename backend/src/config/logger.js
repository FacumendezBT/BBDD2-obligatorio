const winston = require('winston');

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

const fs = require('fs');
const path = require('path');
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const appLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { nombre: 'servicio-votacion-backend' },
    transports: [
        new winston.transports.File({ 
            filename: 'logs.log',
            maxsize: 5242880,
            maxFiles: 20
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

const mysqlLogger = winston.createLogger({
    level: 'error',
    format: logFormat,
    defaultMeta: { nombre: 'servicio-votacion-backend-mysql' },
    transports: [
        new winston.transports.File({ 
            filename: 'mysql-errors.log',
            maxsize: 5242880,
            maxFiles: 20
        })
    ]
});

module.exports = {
    appLogger,
    mysqlLogger
};
