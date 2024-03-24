import { EVENTTYPES } from "../common/constant"
import { TransportData } from "../core/transportData"
import { Breadcrumb } from "../core/breadcrumb"
import { Logger } from "./logger"
import { Options } from "../core/options"
import { variableTypeDetection } from "./is"
import { EMethods } from "../types/options"

// MITO的全局变量
export interface MitoSupport {
    logger: Logger
    breadcrumb: Breadcrumb
    transportData: TransportData
    replaceFlag: { [key in EVENTTYPES]?: boolean }
    record?: any[]
    options?: Options
}

interface Chrome {
    app: Record<string, any>
    csi: () => void
    loadTimes: () => void
    runtime: Record<string, any>
}

interface MITOGlobal {
    console?: Console
    chrome?: Chrome
    __AAX_MITO__?: MitoSupport
}

export type GlobalInterface = MITOGlobal & Window

export const isNodeEnv = variableTypeDetection.isProcess(
    typeof process !== "undefined" ? process : 0,
)

export const isBrowserEnv = variableTypeDetection.isWindow(
    typeof window !== "undefined" ? window : 0,
)
/**
 * 获取全局变量
 *
 * ../returns Global scope object
 */
export function getGlobal<T>() {
    if (isBrowserEnv) return window as unknown as GlobalInterface & T
    if (isNodeEnv) return process as unknown as GlobalInterface & T
    return {} as GlobalInterface & T
}

const _global = getGlobal()
const _support = getGlobalMitoSupport()

export { _global, _support }

_support.replaceFlag = _support.replaceFlag || {}
const { replaceFlag } = _support
export function setFlag(replaceType: EVENTTYPES, isSet: boolean): void {
    if (replaceFlag[replaceType]) return
    replaceFlag[replaceType] = isSet
}

export function getFlag(replaceType: EVENTTYPES): boolean {
    return !!replaceFlag[replaceType]
}

/**
 * 获取全部变量__MITO__的引用地址
 *
 * ../returns global variable of AAX_MITO
 */
export function getGlobalMitoSupport(): MitoSupport {
    _global.__AAX_MITO__ = _global.__AAX_MITO__ || ({} as MitoSupport)
    return _global.__AAX_MITO__
}

export function supportsHistory(): boolean {
    // NOTE: in Chrome App environment, touching history.pushState, *even inside
    //       a try/catch block*, will cause Chrome to output an error to console.error
    // borrowed from: https://github.com/angular/angular.js/pull/13945/files
    const { chrome } = _global
    // tslint:disable-next-line:no-unsafe-any
    const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime
    const hasHistoryApi =
        "history" in _global && !!_global.history.pushState && !!_global.history.replaceState

    return !isChromePackagedApp && hasHistoryApi
}

/**
 * 当前用户的 UUID, 基于以下参数:
 * - 创建时间 (in millisecond)
 * - 随机数 (around 1000~10000000)
 * E.g: 169e68f80c9-1b4104
 */
export function generateUUID() {
    return `${new Date().getTime().toString(16)}-${Math.floor(
        Math.random() * 9999900 + 1000,
    ).toString(16)}`
}

export function ajaxPost(url: string, params: any) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open(EMethods.Post, url)
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.withCredentials = true
        xhr.onload = function () {
            resolve(xhr.response)
        }
        xhr.onerror = function () {
            reject(xhr.response)
        }
        xhr.send(JSON.stringify(params))
    })
}
