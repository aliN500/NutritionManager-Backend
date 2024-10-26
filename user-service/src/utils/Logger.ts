export default class Logger {
  container: string;
  constructor(container: string) {
    this.container = container;
  }
  logError(error: any): void {
    console.error(`[${this.container}]`, error);
  }
  logDebug(data: any): void {
    console.debug(`[${this.container}]`, data);
  }
  logWarning(data: any): void {
    console.warn(`[${this.container}]`, data);
  }
  logInfo(data: any): void {
    console.info(`[${this.container}]`, data);
  }
  logTrace(data: any): void {
    console.trace(`[${this.container}]`, data);
  }
}
export type LoggerLevel =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";
