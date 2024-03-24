import { HTTPTYPE } from "../common/constant"

export type IAnyObject = Record<string, any>

export interface MITOHttp {
    type: HTTPTYPE
    traceId?: string
    method?: string
    url?: string
    status?: number
    reqData?: any
    // statusText?: string
    sTime?: number
    elapsedTime?: number
    responseText?: any
    time?: number
    isSdkUrl?: boolean
}

export interface MITOXMLHttpRequest extends XMLHttpRequest {
    [key: string]: any
    mito_xhr?: MITOHttp
}

export interface ErrorStack {
    args: any[]
    func: string
    column: number
    line: number
    url: string
}

export interface IntegrationError {
    message: string
    name: string
    stacks: ErrorStack[]
}

export type TNumStrObj = number | string | object
