import { InitOptions } from "../types";
import { sendPerformance } from "./sendPerformance";

export function initRender(_: InitOptions): void {
  sendPerformance();
}
