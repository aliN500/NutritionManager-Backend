export default class Logger {
  container: string;
  constructor(container: string) {
    this.container = container;
  }
  error(error: any): void {
    console.error(`[${this.container}] `, {
      error,
      date: (new Date()).toUTCString(),
      pid: process.pid
    });
  }
  debug(data: any): void {
    console.debug(`[${this.container}] `, {
      data,
      date: (new Date()).toUTCString(),
      pid: process.pid
    });
  }
  warning(data: any): void {
    console.warn(`[${this.container}] `, {
      warning: data,
      date: (new Date()).toUTCString(),
      pid: process.pid
    });
  }
  info(data: any): void {
    console.info(`[${this.container}] `, {
      info: data,
      date: (new Date()).toUTCString(),
      pid: process.pid

    });
  }
  trace(data: any): void {
    console.trace(`[${this.container}] `, {
      trace: data,
      date: (new Date()).toUTCString(),
      pid: process.pid
    });
  }
}
export type LoggerLevel =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";
