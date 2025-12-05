import logger from '../utils/logger.js';
import config from '../config/config.js';

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const status = res.statusCode;
    const contentLength = res.get('content-length') || 0;
    const userAgent = req.get('user-agent') || '-';
    const ip = req.ip || req.connection.remoteAddress || '-';

    const statusColor = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
    const logMessage = `${method} ${url} ${status} ${duration}ms - ${contentLength} - ${ip}`;

    if (statusColor === 'ERROR') {
      logger.error(logMessage);
    } else if (statusColor === 'WARN') {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }

    if (config.nodeEnv === 'development' && status >= 400) {
      logger.debug(`Request headers:`, req.headers);
      if (req.body && Object.keys(req.body).length > 0) {
        logger.debug(`Request body:`, req.body);
      }
    }
  });

  next();
};

export default requestLogger;

