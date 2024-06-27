/* eslint-disable no-console -- this is special class logger which needs console*/
export class Logger {
  private static __instance: Logger | null;
  private __isDebugMode = false;

  private constructor() {
    this.__isDebugMode = isDebugMode();
  }

  static getInstance() {
    if (!Logger.__instance) {
      Logger.__instance = new Logger();
    }
    return Logger.__instance;
  }

  private logIfDebugMode(
    method: (...message: unknown[]) => void,
    message: unknown[],
  ) {
    if (this.__isDebugMode) {
      method(...message);
    }
  }

  log(...message: unknown[]) {
    this.logIfDebugMode(console.log, message);
  }

  error(...message: unknown[]) {
    this.logIfDebugMode(console.error, message);
  }

  debug(...message: unknown[]) {
    this.logIfDebugMode(console.debug, message);
  }

  info(...message: unknown[]) {
    this.logIfDebugMode(console.info, message);
  }

  warn(...message: unknown[]) {
    this.logIfDebugMode(console.warn, message);
  }
}

export const isDebugMode = () => {
  return (
    process.env.DEBUG === 'true' || process.env.NEXT_PUBLIC_DEBUG === 'true'
  );
};
