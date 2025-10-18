"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodUpdateProfileSchema = void 0;
const zod_1 = require("zod");
exports.zodUpdateProfileSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        fullName: zod_1.z.string().optional(),
        dateOfBirth: zod_1.z.preprocess((arg) => {
            if (typeof arg === "string" || arg instanceof Date)
                return new Date(arg);
        }, zod_1.z.date().optional()),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        image: zod_1.z.string().optional(),
        user: zod_1.z.string().optional(),
        specialty: zod_1.z.string().optional(),
    })
        .strict(),
});
