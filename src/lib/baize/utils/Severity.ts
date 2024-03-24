/** 上报的错误等级 */
export enum ReportLevelEnum {
    Low = "low",
    Normal = "normal",
    High = "high",
    Critical = "critical",
}

/** 等级程度枚举 */
export enum SeverityEnum {
    Else = "else",
    Error = "error",
    Warning = "warning",
    Info = "info",
    Debug = "debug",
    Low = "low",
    Normal = "normal",
    High = "high",
    Critical = "critical",
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Severity {
    /**
     * Converts a string-based level into a {@link Severity}.
     *
     * @param level string representation of Severity
     * @returns Severity
     */
    export function fromString(level: string): SeverityEnum {
        switch (level) {
            case "debug":
                return SeverityEnum.Debug
            case "info":
            case "log":
            case "assert":
                return SeverityEnum.Info
            case "warn":
            case "warning":
                return SeverityEnum.Warning
            case ReportLevelEnum.Low:
            case ReportLevelEnum.Normal:
            case ReportLevelEnum.High:
            case ReportLevelEnum.Critical:
            case "error":
                return SeverityEnum.Error
            default:
                return SeverityEnum.Else
        }
    }
}
