import { LogLevel } from "@microsoft/signalr";

export interface SignalingConfiguration {
    logLevel?: LogLevel;
    url: string;
}