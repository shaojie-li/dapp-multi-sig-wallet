import { setupReplace } from "./browser/load"
import { log } from "./core/index"
import { isBrowserEnv, _global } from "./utils/index"
import { InitOptions } from "./types/index"
import { errorBoundaryReport } from "./React"
import initOptions from "./common/initOpitons"
import { sendPerformance } from "./core/sendPerformance"
// import { initRender } from "./core/initRender"

function webInit(options = {} as InitOptions): void {
    if (!("XMLHttpRequest" in _global) || options.disabled) return
    initOptions(options)
    setupReplace()
    // initRender(options)
}

function init(options = {} as InitOptions): void {
    if (isBrowserEnv) {
        webInit(options)
    }
}

export default { init, log, errorBoundaryReport, performance: sendPerformance }
