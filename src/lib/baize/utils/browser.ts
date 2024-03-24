import { EVENTTYPES, ERRORTYPES } from "../common/constant";
import { getLocationHref, getTimestamp } from "./helpers";
import { setFlag } from "./global";
import { InitOptions } from "../types";
import { ReportLevelEnum } from "./Severity";

/**
 * 返回包含id、class、innerTextde字符串的标签
 * @param target html节点
 */
export function htmlElementAsString(target: HTMLElement) {
  const tagName = target.tagName.toLowerCase();
  if (tagName === "body") {
    return null;
  }
  let classNames = target.classList.value;
  classNames = classNames !== "" ? ` class="${classNames}"` : "";
  const id = target.id ? ` id="${target.id}"` : "";
  const innerText = target.innerText;
  return `<${tagName}${id}${
    classNames !== "" ? classNames : ""
  }>${innerText}</${tagName}>`;
}

/**
 * 将地址字符串转换成对象
 * @returns 返回一个对象
 */
export function parseUrlToObj(url: string): {
  host?: string;
  path?: string;
  protocol?: string;
  relative?: string;
} {
  if (!url) {
    return {};
  }

  const match = url.match(
    /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/
  );

  if (!match) {
    return {};
  }

  const query = match[6] || "";
  const fragment = match[8] || "";
  return {
    host: match[4],
    path: match[5],
    protocol: match[2],
    relative: match[5] + query + fragment, // everything minus origin
  };
}

export function setSilentFlag(opitons = {} as InitOptions): void {
  setFlag(EVENTTYPES.XHR, !!opitons.silentXhr);
  setFlag(EVENTTYPES.FETCH, !!opitons.silentFetch);
  setFlag(EVENTTYPES.CONSOLE, !!opitons.silentConsole);
  setFlag(EVENTTYPES.DOM, !!opitons.silentDom);
  setFlag(EVENTTYPES.HISTORY, !!opitons.silentHistory);
  setFlag(EVENTTYPES.ERROR, !!opitons.silentError);
  setFlag(EVENTTYPES.HASHCHANGE, !!opitons.silentHashchange);
  setFlag(EVENTTYPES.UNHANDLEDREJECTION, !!opitons.silentUnhandledrejection);
}

/**
 * 解析error的stack，并返回args、column、line、func、url:
 * @param ex
 * @param level
 */
export function extractErrorStack(ex: any, level: ReportLevelEnum) {
  const normal = {
    time: getTimestamp(),
    url: getLocationHref(),
    name: ex.name,
    level,
    message: ex.message,
  };
  if (typeof ex.stack === "undefined" || !ex.stack) {
    return normal;
  }

  const chrome =
    /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|[a-z]:|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
  const gecko =
    /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i;
  const winjs =
    /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
  // Used to additionally parse URL/line/column from eval frames
  const geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
  const chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/;
  const lines = ex.stack.split("\n");
  const stack = [] as any[];

  let submatch;
  let parts;
  let element: any;
  // reference = /^(.*) is undefined$/.exec(ex.message)

  for (let i = 0, j = lines.length; i < j; ++i) {
    // eslint-disable-next-line no-cond-assign
    if ((parts = chrome.exec(lines[i]))) {
      const isNative = parts[2] && parts[2].indexOf("native") === 0; // start of line
      const isEval = parts[2] && parts[2].indexOf("eval") === 0; // start of line
      // eslint-disable-next-line no-cond-assign
      if (isEval && (submatch = chromeEval.exec(parts[2]))) {
        parts[2] = submatch[1]; // url
        parts[3] = submatch[2]; // line
        parts[4] = submatch[3]; // column
      }
      element = {
        url: !isNative ? parts[2] : null,
        func: parts[1] || ERRORTYPES.UNKNOWN_FUNCTION,
        args: isNative ? [parts[2]] : [],
        line: parts[3] ? +parts[3] : null,
        column: parts[4] ? +parts[4] : null,
      };
      // eslint-disable-next-line no-cond-assign
    } else if ((parts = winjs.exec(lines[i]))) {
      element = {
        url: parts[2],
        func: parts[1] || ERRORTYPES.UNKNOWN_FUNCTION,
        args: [],
        line: +parts[3],
        column: parts[4] ? +parts[4] : null,
      };
      // eslint-disable-next-line no-cond-assign
    } else if ((parts = gecko.exec(lines[i]))) {
      const isEval = parts[3] && parts[3].indexOf(" > eval") > -1;
      // eslint-disable-next-line no-cond-assign
      if (isEval && (submatch = geckoEval.exec(parts[3]))) {
        parts[3] = submatch[1];
        parts[4] = submatch[2];
        parts[5] = ""; // no column when eval
      } else if (
        i === 0 &&
        !parts[5] &&
        typeof ex.columnNumber !== "undefined" &&
        stack[0]
      ) {
        stack[0].column = ex.columnNumber + 1;
      }
      element = {
        url: parts[3],
        func: parts[1] || ERRORTYPES.UNKNOWN_FUNCTION,
        args: parts[2] ? parts[2].split(",") : [],
        line: parts[4] ? +parts[4] : null,
        column: parts[5] ? +parts[5] : null,
      };
    }

    if (!element?.func && element?.line) {
      element.func = ERRORTYPES.UNKNOWN_FUNCTION;
    }

    stack.push(element);
  }

  if (!stack.length) {
    return null;
  }
  return {
    ...normal,
    stack,
  };
}

/**
 * 根据name获取cookie
 *
 * @param {string} name
 * @returns {string | null}
 */
export function getCookie(name: string): string | null {
  // let arr: RegExpMatchArray | null;
  // const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
  // if ((arr = document.cookie.match(reg))) {
  //   return unescape(arr[2]);
  // }
  return null;
}
