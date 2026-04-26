interface ILogger {
  log: (...data: unknown[]) => void;
  warn: (...data: unknown[]) => void;
  error: (...data: unknown[]) => void;
};

class Logger implements ILogger {
  log = console.log;
  warn = console.warn;
  error = console.error;
};

const emptyValue = {
  log: () => {},
  warn: () => {},
  error: () => {},
};

const LoggerInstance = process.env.NEXT_PUBLIC_DEVELOPMENT ? new Logger() : emptyValue;

export default LoggerInstance;