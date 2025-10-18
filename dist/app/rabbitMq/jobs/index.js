"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchJob = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const rabbitMq_1 = require("../rabbitMq");
const QUEUE = "job_queue";
const dispatchJob = (job) => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield (0, rabbitMq_1.getRabbitConnection)();
    const channel = yield conn.createChannel();
    yield channel.assertQueue(QUEUE, { durable: true });
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(job)), {
        persistent: true,
    });
    yield channel.close();
});
exports.dispatchJob = dispatchJob;
