import { createLogger, format, transports } from "winston";

const isDev = process.env.NODE_ENV !== "production";

const logger = createLogger({
  level: isDev ? "debug" : "info",
  format: isDev
    ? format.combine(
        format.colorize(),
        format.simple(),
      )
    : format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
      ),
  transports: [new transports.Console()],
});

/** Morgan-compatible write stream */
export const morganStream = {
  write: (message: string) => logger.http(message.trimEnd()),
};

export default logger;
