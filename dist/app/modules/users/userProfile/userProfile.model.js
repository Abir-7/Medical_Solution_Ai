"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfile = void 0;
const mongoose_1 = require("mongoose");
const userProfileSchema = new mongoose_1.Schema({
    fullName: { type: String, default: "" },
    dateOfBirth: { type: Date, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    image: { type: String, default: "" },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", unique: true },
    specialty: {
        type: String,
        default: null,
    },
    country: {
        type: String,
        default: "",
    },
});
exports.UserProfile = (0, mongoose_1.model)("UserProfile", userProfileSchema);
