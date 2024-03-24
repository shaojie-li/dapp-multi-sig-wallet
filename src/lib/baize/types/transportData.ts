import { ERRORTYPES } from "../common/constant"
import { BreadcrumbPushData } from "./breadcrumb"

export interface ProjectInfo {
    apikey: string
    trackerId?: string
}

export interface TransportDataType {
    projectInfo: ProjectInfo
    breadcrumb: BreadcrumbPushData[]
    data: ReportDataType
    record?: any[]
}

export interface ReportDataType {
    url: string
    level: string
    type?: ERRORTYPES
    message?: string
    name?: string
    stack?: any[]
    time?: number
    errorId?: number
    // ajax
    elapsedTime?: number
    request?: {
        httpType?: string
        traceId?: string
        method: string
        url: string
        data: any
    }
    response?: {
        status: number
        data: string
    }
    propsData?: any
    // logError 手动报错 AAX_MITO.log
    customTag?: string
}
