import {
    _global,
    on,
    getTimestamp,
    replaceOld,
    throttle,
    getLocationHref,
    isExistProperty,
    variableTypeDetection,
    supportsHistory,
    GlobalInterface,
} from "../utils"
import { voidFun, EVENTTYPES, HTTPTYPE, HTTP_CODE } from "../common/constant"
import { transportData } from "../core/transportData"
import { options, setTraceId } from "../core/options"
import { EMethods } from "../types/options"
import { ReplaceHandler, subscribeEvent, triggerHandlers } from "../common/subscribe"
import { MITOHttp, MITOXMLHttpRequest } from "../types/common"

const clickThrottle = throttle(triggerHandlers, 600)

function isFilterHttpUrl(url: string) {
    return options.filterXhrUrlRegExp && options.filterXhrUrlRegExp.test(url)
}

function replace(type: EVENTTYPES) {
    switch (type) {
        case EVENTTYPES.XHR:
            xhrReplace()
            break
        case EVENTTYPES.FETCH:
            fetchReplace()
            break
        case EVENTTYPES.ERROR:
            listenError()
            break
        case EVENTTYPES.CONSOLE:
            consoleReplace()
            break
        case EVENTTYPES.HISTORY:
            historyReplace()
            break
        case EVENTTYPES.UNHANDLEDREJECTION:
            unhandledrejectionReplace()
            break
        case EVENTTYPES.DOM:
            domReplace()
            break
        case EVENTTYPES.HASHCHANGE:
            listenHashchange()
            break
        default:
            break
    }
}

export function addReplaceHandler(handler: ReplaceHandler) {
    if (!subscribeEvent(handler)) return
    replace(handler.type as EVENTTYPES)
}

function xhrReplace(): void {
    if (!("XMLHttpRequest" in _global)) {
        return
    }
    const originalXhrProto = XMLHttpRequest.prototype
    replaceOld(originalXhrProto, "open", (originalOpen: voidFun): voidFun => {
        return function (this: MITOXMLHttpRequest, ...args: any[]) {
            this.mito_xhr = {
                method: variableTypeDetection.isString(args[0]) ? args[0].toUpperCase() : args[0],
                url: args[1],
                sTime: getTimestamp(),
                type: HTTPTYPE.XHR,
            }
            originalOpen.apply<any, any, any>(this, args)
        }
    })
    replaceOld(originalXhrProto, "send", (originalSend: voidFun): voidFun => {
        return function (this: MITOXMLHttpRequest, ...args: any[]): void {
            const method = this.mito_xhr?.method
            const url = this.mito_xhr?.url
            if (!method || !url) return

            setTraceId(url, (headerFieldName: string, traceId: string) => {
                this.mito_xhr!.traceId = traceId
                this.setRequestHeader(headerFieldName, traceId)
            })

            options.beforeAppAjaxSend?.({ method, url }, this)

            on(this, "loadend", function (this: MITOXMLHttpRequest) {
                if (
                    (method === EMethods.Post && transportData.isSdkTransportUrl(url)) ||
                    isFilterHttpUrl(url)
                )
                    return
                const { responseType, response, status } = this
                this.mito_xhr!.reqData = args[0]
                const eTime = getTimestamp()
                this.mito_xhr!.time = eTime
                this.mito_xhr!.status = status
                if (["", "json", "text"].indexOf(responseType) !== -1) {
                    this.mito_xhr!.responseText =
                        typeof response === "object" ? JSON.stringify(response) : response
                }
                this.mito_xhr!.elapsedTime = eTime - this.mito_xhr!.sTime!
                triggerHandlers(EVENTTYPES.XHR, this.mito_xhr)
            })
            originalSend.apply<any, any, any>(this, args)
        }
    })
}

function fetchReplace(): void {
    if (!("fetch" in _global)) {
        return
    }
    replaceOld(_global, EVENTTYPES.FETCH, (originalFetch: voidFun) => {
        return function (url: string, config: Partial<Request> = {}): void {
            const sTime = getTimestamp()
            const method = (config && config.method) || "GET"
            let handlerData: MITOHttp = {
                type: HTTPTYPE.FETCH,
                method,
                reqData: config && config.body,
                url,
            }
            const headers = new Headers(config.headers || {})
            Object.assign(headers, {
                setRequestHeader: headers.set,
            })
            setTraceId(url, (headerFieldName: string, traceId: string) => {
                handlerData.traceId = traceId
                headers.set(headerFieldName, traceId)
            })
            options.beforeAppAjaxSend?.({ method, url }, headers)
            const configs = {
                ...config,
                headers,
            }

            return originalFetch.apply<GlobalInterface, any[], any>(_global, [url, configs]).then(
                (res: Response) => {
                    const tempRes = res.clone()
                    const eTime = getTimestamp()
                    handlerData = {
                        ...handlerData,
                        elapsedTime: eTime - sTime,
                        status: tempRes.status,
                        // statusText: tempRes.statusText,
                        time: eTime,
                    }
                    tempRes.text().then(data => {
                        if (method === EMethods.Post && transportData.isSdkTransportUrl(url)) return
                        if (isFilterHttpUrl(url)) return
                        handlerData.responseText = tempRes.status > HTTP_CODE.UNAUTHORIZED && data
                        triggerHandlers(EVENTTYPES.FETCH, handlerData)
                    })
                    return res
                },
                (err: Error) => {
                    const eTime = getTimestamp()
                    if (method === EMethods.Post && transportData.isSdkTransportUrl(url)) return
                    if (isFilterHttpUrl(url)) return
                    handlerData = {
                        ...handlerData,
                        elapsedTime: eTime - sTime,
                        status: 0,
                        // statusText: err.name + err.message,
                        time: eTime,
                    }
                    triggerHandlers(EVENTTYPES.FETCH, handlerData)
                    throw err
                },
            )
        }
    })
}

function listenHashchange(): void {
    if (!isExistProperty(_global, "onpopstate")) {
        on(_global, EVENTTYPES.HASHCHANGE, (e: HashChangeEvent) => {
            triggerHandlers(EVENTTYPES.HASHCHANGE, e)
        })
    }
}

function listenError(): void {
    on(
        _global,
        "error",
        (e: ErrorEvent) => {
            triggerHandlers(EVENTTYPES.ERROR, e)
        },
        true,
    )
}

function consoleReplace(): void {
    if (!("console" in _global)) {
        return
    }
    const logType = ["log", "debug", "info", "warn", "error", "assert"]
    logType.forEach((level: string): void => {
        if (!_global.console) return
        if (!(level in _global.console)) return
        replaceOld(_global.console, level, (originalConsole: () => any) => (...args: any[]) => {
            if (originalConsole) {
                triggerHandlers(EVENTTYPES.CONSOLE, { args, level })
                originalConsole.apply<GlobalInterface["console"], any, any>(_global.console, args)
            }
        })
    })
}
// 上一次的路由
let lastHref: string
lastHref = getLocationHref()
function historyReplace(): void {
    if (!supportsHistory()) return
    const oldOnpopstate = _global.onpopstate
    _global.onpopstate = function (this: WindowEventHandlers, ...args: any[]): any {
        const to = getLocationHref()
        const from = lastHref
        triggerHandlers(EVENTTYPES.HISTORY, {
            from,
            to,
        })

        oldOnpopstate?.apply<WindowEventHandlers, any, any>(this, args)
    }
    function historyReplaceFn(originalHistoryFn: voidFun): voidFun {
        return function (this: History, ...args: any[]): void {
            const url = args.length > 2 ? args[2] : undefined
            if (url) {
                const from = lastHref
                const to = String(url)
                lastHref = to
                triggerHandlers(EVENTTYPES.HISTORY, {
                    from,
                    to,
                })
            }
            return originalHistoryFn.apply<History, any, any>(this, args)
        }
    }
    replaceOld(_global.history, "pushState", historyReplaceFn)
    replaceOld(_global.history, "replaceState", historyReplaceFn)
}

function unhandledrejectionReplace(): void {
    on(_global, EVENTTYPES.UNHANDLEDREJECTION, (ev: PromiseRejectionEvent) => {
        // ev.preventDefault() 阻止默认行为后，控制台就不会再报红色错误
        triggerHandlers(EVENTTYPES.UNHANDLEDREJECTION, ev)
    })
}

function domReplace(): void {
    if (!("document" in _global)) return
    on(
        _global.document,
        "click",
        () => {
            clickThrottle(EVENTTYPES.DOM, {
                category: "click",
                data: _global.document,
            })
        },
        true,
    )
}
