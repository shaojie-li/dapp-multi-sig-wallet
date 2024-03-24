import { ajaxPost } from "../utils/global"

/** 新能参数发送至服务器 */
export async function sendPerformance() {
    try {
        const performance = window.performance
        await ajaxPost("/performance", {
            url: window.location.href,
            performance: performance.timing,
        })
    } catch (error) {
        console.error("error - send performance", error)
    }
}
