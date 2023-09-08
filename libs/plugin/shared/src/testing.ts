export interface ITest {
    name: string;
    description: string;
    file: string;
    line: number;
    run: () => Promise<ITestResult>;
}

export interface ITestResult {
    readonly name: string;
    readonly description: string;
    readonly assertions: IAssertionResult[];
}

export interface IAssertionResult {
    readonly code: string;
    readonly passed: boolean;
    readonly message: string;
}
