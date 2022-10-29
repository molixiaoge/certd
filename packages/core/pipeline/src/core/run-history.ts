import { Context, HistoryResult, Pipeline, Runnable } from "../d.ts";
import _ from "lodash";
import { buildLogger } from "../utils/util.log";
import { Logger } from "log4js";

export type HistoryStatus = {
  result: HistoryResult;
  logs: string[];
};

export class RunHistory {
  id: string;
  //运行时上下文变量
  context: Context = {};
  pipeline: Pipeline;
  logs: {
    [runnableId: string]: string[];
  } = {};
  loggers: {
    [runnableId: string]: Logger;
  } = {};
  constructor(runtimeId: any, pipeline: Pipeline) {
    this.id = runtimeId;
    this.pipeline = pipeline;
  }

  start(runnable: Runnable): HistoryResult {
    const now = new Date().getTime();
    this.logs[runnable.id] = [];
    this.loggers[runnable.id] = buildLogger((text) => {
      this.logs[runnable.id].push(text);
    });
    const status: HistoryResult = {
      status: "start",
      startTime: now,
      result: "start",
    };
    runnable.status = status;
    this.log(runnable, `开始执行`);
    return status;
  }

  success(runnable: Runnable) {
    const now = new Date().getTime();
    const status = runnable.status;
    _.merge(status, {
      status: "success",
      endTime: now,
      result: "success",
    });
    this.log(runnable, `执行成功`);
  }

  skip(runnable: Runnable) {
    const now = new Date().getTime();
    const status = runnable.status;
    _.merge(status, {
      status: "success",
      endTime: now,
      result: "skip",
    });
    this.log(runnable, `跳过`);
  }

  error(runnable: Runnable, e: Error) {
    const now = new Date().getTime();
    const status = runnable.status;
    _.merge(status, {
      status: "error",
      endTime: now,
      result: "error",
      message: e.message,
    });

    this.log(runnable, `执行异常：${e.message}`);
  }

  log(runnable: Runnable, text: string) {
    // @ts-ignore
    this.loggers[runnable.id].info(`[${runnable.title}]<id:${runnable.id}> [${runnable.runnableType}]`, text);
  }

  finally(runnable: Runnable) {
    //
  }
}
