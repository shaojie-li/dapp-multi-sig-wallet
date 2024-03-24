import {
  _support,
  validateOption,
  isBrowserEnv,
  variableTypeDetection,
  Queue,
  generateUUID,
} from "../utils";
import createErrorId from "./errorId";
import { SERVER_URL } from "../common/config";
import { breadcrumb } from "./breadcrumb";
import { EMethods, InitOptions } from "../types/options";
import {
  ProjectInfo,
  TransportDataType,
  ReportDataType,
} from "../types/transportData";
import { ignoreReportUrl } from "../ignore";
import { getCookie } from "../utils/browser";
/**
 * 用来传输数据类，包含img标签、xhr请求
 * 功能：支持img请求和xhr请求、可以断点续存（保存在localstorage），
 * 待开发：目前不需要断点续存，因为接口不是很多，只有错误时才触发，如果接口太多可以考虑合并接口、
 *
 * ../class Transport
 */
export class TransportData {
  // static img = new Image()
  queue: Queue;
  private beforeDataReport: unknown = null;
  private configReportXhr: unknown = null;
  private apikey: string = "";
  private options = {} as InitOptions;
  public url: string = "";
  public backTrackerId: string;
  constructor(url = "") {
    this.url = url;
    this.queue = new Queue();
    this.backTrackerId = this.getTrackerId();
  }
  // imgRequest(data: Record<string, unknown>): void {
  //   TransportData.img.src = `${this.url}?${splitObjToQuery(data)}`
  // }
  getRecord(): any[] {
    const recordData = _support.record;
    if (
      recordData &&
      variableTypeDetection.isArray(recordData) &&
      recordData.length > 2
    ) {
      return recordData;
    }
    return [];
  }
  async beforePost(data: ReportDataType) {
    const errorId = createErrorId(data, this.apikey);
    if (!errorId) return false;
    data.errorId = errorId;
    let transportData = this.getTransportData(data);
    if (typeof this.beforeDataReport === "function") {
      transportData = await this.beforeDataReport(transportData);
      if (!transportData) return false;
    }
    return JSON.stringify(transportData || "{}");
  }
  async xhrPost(data: ReportDataType) {
    const result = await this.beforePost(data);
    if (!result) return;
    const requestFun = (): void => {
      const xhr = new XMLHttpRequest();
      xhr.open(EMethods.Post, this.url);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.withCredentials = true;

      if (typeof this.configReportXhr === "function") {
        this.configReportXhr(xhr);
      }
      xhr.send(result);
    };
    this.queue.addFn(requestFun);
  }
  getProjectInfo(): ProjectInfo {
    const trackerId = this.getTrackerId();
    const { apikey } = this.options;
    return {
      trackerId,
      apikey,
    };
  }
  getTrackerId() {
    const trackerIdFromCookie = getCookie("userId");
    if (trackerIdFromCookie) {
      return trackerIdFromCookie;
    }
    const trackerIdFromStorage = localStorage.getItem("trackerId");
    if (trackerIdFromStorage) {
      return trackerIdFromStorage;
    }
    const newTrackerId = generateUUID();
    localStorage.setItem("trackerId", newTrackerId);
    return newTrackerId;
  }
  getTransportData(data: ReportDataType): TransportDataType {
    return {
      projectInfo: this.getProjectInfo(),
      breadcrumb: breadcrumb.getStack(),
      data,
      record: this.getRecord(),
    };
  }
  isSdkTransportUrl(targetUrl: string): boolean {
    return targetUrl.indexOf(this.url) !== -1;
  }
  bindOptions(options = {} as InitOptions) {
    this.options = options;
    const {
      dns = "",
      beforeDataReport,
      apikey = "",
      configReportXhr,
    } = options;
    const backTrackerId = this.getTrackerId();
    validateOption(apikey, "apikey", "string") && (this.apikey = apikey);
    validateOption(dns, "url", "string") && (this.url = dns);
    validateOption(beforeDataReport, "beforeDataReport", "function") &&
      (this.beforeDataReport = beforeDataReport);
    validateOption(configReportXhr, "configReportXhr", "function") &&
      (this.configReportXhr = configReportXhr);
    validateOption(backTrackerId, "backTrackerId", "string");
  }
  send(data: ReportDataType) {
    if (isBrowserEnv) {
      // 根据url中包含的字符串，过滤一些不需要上报的请求
      const isIgnore = ignoreReportUrl.some((ignoreKeyword) =>
        data.request?.url.includes(ignoreKeyword)
      );
      if (isIgnore) return;

      data.stack = data.stack?.filter(Boolean);
      return this.xhrPost(data);
    }
    return null;
  }
}
const transportData =
  _support.transportData ||
  (_support.transportData = new TransportData(SERVER_URL));
export { transportData };
