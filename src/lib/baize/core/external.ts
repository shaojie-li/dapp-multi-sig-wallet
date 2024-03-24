import { ERRORTYPES, BREADCRUMBTYPES } from "../common/constant"
import {
    isError,
    extractErrorStack,
    getLocationHref,
    getTimestamp,
    unknownToString,
} from "../utils/index"
import { transportData } from "./transportData"
import { breadcrumb } from "./breadcrumb"
import { Severity, ReportLevelEnum } from "../utils/Severity"
import { TNumStrObj } from "../types/common"

interface LogTypes {
    message: TNumStrObj
    tag?: TNumStrObj
    level?: ReportLevelEnum
    ex?: Error | any
}

/**
 *
 * 自定义上报事件
 * @export
 * @param {LogTypes} { message = 'emptyMsg', tag = '', level = Severity.Critical, ex = '' }
 */
export function log({
    message = "emptyMsg",
    tag = "",
    level = ReportLevelEnum.Critical,
    ex = "",
}: LogTypes): void {
    let errorInfo = {} as any
    if (isError(ex)) {
        errorInfo = extractErrorStack(ex, level)
    }
    const error = {
        type: ERRORTYPES.LOG_ERROR,
        level,
        message: unknownToString(message),
        name: "AAX_MITO.log",
        customTag: unknownToString(tag),
        time: getTimestamp(),
        url: getLocationHref(),
        ...errorInfo,
    }
    breadcrumb.push({
        type: BREADCRUMBTYPES.CUSTOMER,
        category: breadcrumb.getCategory(BREADCRUMBTYPES.CUSTOMER),
        data: message,
        level: Severity.fromString(level.toString()),
    })
    transportData.send(error)
}
