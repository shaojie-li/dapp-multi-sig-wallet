import {
  BREADCRUMBTYPES,
  ERRORTYPES,
  globalVar,
  ERROR_TYPE_RE,
  HTTP_CODE,
} from "../common/constant";
import { resourceTransform, httpTransform } from "../core/transformData";
import { transportData } from "../core/transportData";
import { breadcrumb } from "../core/breadcrumb";
import {
  getLocationHref,
  getTimestamp,
  isError,
  parseUrlToObj,
  extractErrorStack,
  unknownToString,
} from "../utils";
import { ReportDataType } from "../types/transportData";
import { Severity, SeverityEnum, ReportLevelEnum } from "../utils/Severity";
import { Replace } from "../types/replace";
import { MITOHttp } from "../types/common";

export interface ResourceErrorTarget {
  src?: string;
  href?: string;
  localName?: string;
}

const HandleEvents = {
  /**
   * 处理xhr、fetch回调
   */
  handleHttp(data: MITOHttp, type: BREADCRUMBTYPES): void {
    const hasError =
      data.status === 0 ||
      data.status === HTTP_CODE.BAD_REQUEST ||
      data.status! > HTTP_CODE.UNAUTHORIZED;
    const result = httpTransform(data);
    breadcrumb.push({
      type,
      category: breadcrumb.getCategory(type),
      data: { ...result },
      level: SeverityEnum.Info,
    });
    if (hasError) {
      breadcrumb.push({
        type,
        category: breadcrumb.getCategory(BREADCRUMBTYPES.CODE_ERROR),
        data: { ...result },
        level: SeverityEnum.Error,
      });
      transportData.send(result);
    }
  },
  /**
   * 处理window的error的监听回到
   */
  handleError(errorEvent: ErrorEvent) {
    const target = errorEvent.target as ResourceErrorTarget;
    if (target.localName) {
      // 资源加载错误 提取有用数据
      const data = resourceTransform(errorEvent.target as ResourceErrorTarget);
      breadcrumb.push({
        type: BREADCRUMBTYPES.RESOURCE,
        category: breadcrumb.getCategory(BREADCRUMBTYPES.RESOURCE),
        data,
        level: SeverityEnum.Error,
      });
      return transportData.send(data);
    }
    // code error
    const { message, filename, lineno, colno, error } = errorEvent;
    let result: any;
    if (error && isError(error)) {
      result = extractErrorStack(error, ReportLevelEnum.High);
    }
    // 处理SyntaxError，stack没有lineno、colno
    result = HandleEvents.handleNotErrorInstance(
      message,
      filename,
      lineno,
      colno,
      ReportLevelEnum.High
    );
    result.type = ERRORTYPES.JAVASCRIPT_ERROR;
    breadcrumb.push({
      type: BREADCRUMBTYPES.CODE_ERROR,
      category: breadcrumb.getCategory(BREADCRUMBTYPES.CODE_ERROR),
      data: { ...result },
      level: SeverityEnum.Error,
    });
    return transportData.send(result);
  },
  handleNotErrorInstance(
    message: string,
    filename: string,
    lineno: number,
    colno: number,
    level: ReportLevelEnum
  ) {
    let name: string | ERRORTYPES = ERRORTYPES.UNKNOWN;
    const url = filename || getLocationHref();
    let msg = message;
    const matches = message.match(ERROR_TYPE_RE);
    if (matches?.[1]) {
      name = matches[1];
      msg = matches[2];
    }
    const element = {
      url,
      func: ERRORTYPES.UNKNOWN_FUNCTION,
      args: ERRORTYPES.UNKNOWN,
      line: lineno,
      col: colno,
    };
    return {
      url,
      name,
      message: msg,
      level,
      time: getTimestamp(),
      stack: [element],
    };
  },
  handleHistory(data: Replace.IRouter): void {
    const { from, to } = data;
    const { relative: parsedFrom } = parseUrlToObj(from);
    const { relative: parsedTo } = parseUrlToObj(to);
    breadcrumb.push({
      type: BREADCRUMBTYPES.ROUTE,
      category: breadcrumb.getCategory(BREADCRUMBTYPES.ROUTE),
      data: {
        from: parsedFrom || "/",
        to: parsedTo || "/",
      },
      level: SeverityEnum.Info,
    });
  },
  handleHashchange(data: HashChangeEvent): void {
    const { oldURL, newURL } = data;
    const { relative: from } = parseUrlToObj(oldURL);
    const { relative: to } = parseUrlToObj(newURL);
    breadcrumb.push({
      type: BREADCRUMBTYPES.ROUTE,
      category: breadcrumb.getCategory(BREADCRUMBTYPES.ROUTE),
      data: {
        from,
        to,
      },
      level: SeverityEnum.Info,
    });
  },
  handleUnhandleRejection(ev: PromiseRejectionEvent): void {
    const extractErrorInfo = extractErrorStack(ev.reason, ReportLevelEnum.High);
    if (extractErrorInfo?.name === "AbortError") return;
    let data: ReportDataType = {
      type: ERRORTYPES.PROMISE_ERROR,
      message: unknownToString(ev.reason),
      url: getLocationHref(),
      name: ev.type,
      time: getTimestamp(),
      level: ReportLevelEnum.Low,
    };
    if (isError(ev.reason)) {
      data = {
        ...data,
        ...extractErrorInfo,
      };
    }
    breadcrumb.push({
      type: BREADCRUMBTYPES.UNHANDLEDREJECTION,
      category: breadcrumb.getCategory(BREADCRUMBTYPES.UNHANDLEDREJECTION),
      data: { ...data },
      level: SeverityEnum.Error,
    });
    transportData.send(data);
  },
  handleConsole(data: Replace.TriggerConsole): void {
    if (globalVar.isLogAddBreadcrumb) {
      breadcrumb.push({
        type: BREADCRUMBTYPES.CONSOLE,
        category: breadcrumb.getCategory(BREADCRUMBTYPES.CONSOLE),
        data,
        level: Severity.fromString(data.level),
      });
    }
  },
};

export { HandleEvents };
