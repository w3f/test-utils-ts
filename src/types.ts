export interface TestService {
    start(): Promise<void>;
    stop(): Promise<void>;
    endpoint(): string;
}
