import { BREADCRUMBTYPES, BREADCRUMBCATEGORYS } from "../common/constant";
import {
  logger,
  validateOption,
  getTimestamp,
  slientConsoleScope,
  _support,
} from "../utils";
import { BreadcrumbPushData, InitOptions } from "../types";

export class Breadcrumb {
  private maxBreadcrumbs = 10;
  private beforePushBreadcrumb: unknown = null;
  private stack: BreadcrumbPushData[] = [];
  /**
   * 添加用户行为栈
   *
   * ../param {BreadcrumbPushData} data
   * ../memberof Breadcrumb
   */
  public push(data: BreadcrumbPushData): void {
    if (typeof this.beforePushBreadcrumb === "function") {
      let result: BreadcrumbPushData | null = null;
      // 如果用户输入console，并且logger是打开的会造成无限递归，
      // 应该加入一个开关，执行这个函数前，把监听console的行为关掉
      const beforePushBreadcrumb = this.beforePushBreadcrumb;
      slientConsoleScope(() => {
        result = beforePushBreadcrumb(this, data);
      });
      if (!result) return;
      this.immediatePush(result);
      return;
    }
    this.immediatePush(data);
  }
  immediatePush(data: BreadcrumbPushData): void {
    if (this.stack.length >= this.maxBreadcrumbs) {
      this.shift();
    }
    this.stack.push({ time: getTimestamp(), ...data });
    logger.log(this.stack);
  }
  shift(): boolean {
    return this.stack.shift() !== undefined;
  }
  clear(): void {
    this.stack = [];
  }
  getStack(): BreadcrumbPushData[] {
    return this.stack;
  }
  getCategory(type: BREADCRUMBTYPES) {
    switch (type) {
      case BREADCRUMBTYPES.XHR:
      case BREADCRUMBTYPES.FETCH:
        return BREADCRUMBCATEGORYS.HTTP;
      case BREADCRUMBTYPES.CLICK:
      case BREADCRUMBTYPES.ROUTE:
      case BREADCRUMBTYPES.CUSTOMER:
      case BREADCRUMBTYPES.CONSOLE:
        return BREADCRUMBCATEGORYS.DEBUG;
      case BREADCRUMBTYPES.UNHANDLEDREJECTION:
      case BREADCRUMBTYPES.CODE_ERROR:
      case BREADCRUMBTYPES.RESOURCE:
      case BREADCRUMBTYPES.REACT:
      default:
        return BREADCRUMBCATEGORYS.EXCEPTION;
    }
  }
  bindOptions(options = {} as InitOptions): void {
    const { maxBreadcrumbs, beforePushBreadcrumb } = options;
    validateOption(maxBreadcrumbs, "maxBreadcrumbs", "number") &&
      (this.maxBreadcrumbs = maxBreadcrumbs!);
    validateOption(beforePushBreadcrumb, "beforePushBreadcrumb", "function") &&
      (this.beforePushBreadcrumb = beforePushBreadcrumb);
  }
}
const breadcrumb =
  _support.breadcrumb || (_support.breadcrumb = new Breadcrumb());
export { breadcrumb };
