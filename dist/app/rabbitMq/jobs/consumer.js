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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startJobConsumer = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const logger_1 = __importDefault(require("../../utils/serverTools/logger"));
const rabbitMq_1 = require("../rabbitMq");
const email_worker_1 = require("./worker/email.worker");
const QUEUE = "job_queue";
const startJobConsumer = () => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield (0, rabbitMq_1.getRabbitConnection)();
    const channel = yield conn.createChannel();
    yield channel.assertQueue(QUEUE, { durable: true });
    logger_1.default.info("🔁 Waiting for jobs...");
    channel.consume(QUEUE, (msg) => __awaiter(void 0, void 0, void 0, function* () {
        if (!msg)
            return;
        const payload = JSON.parse(msg.content.toString());
        try {
            switch (payload.type) {
                case "email":
                    yield (0, email_worker_1.handleEmailJob)(payload.data);
                    break;
                // Add more job types here
                default:
                    logger_1.default.warn("Unknown job type:", payload.type);
            }
            channel.ack(msg);
        }
        catch (err) {
            logger_1.default.error("Job failed:", err);
            // channel.nack(msg, false, true); // optional retry
        }
    }), { noAck: false });
});
exports.startJobConsumer = startJobConsumer;
