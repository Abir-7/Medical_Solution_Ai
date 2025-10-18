"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Define the Mongoose schema for TokenPackage
const tokenPackageSchema = new mongoose_1.Schema({
    price: {
        type: Number,
        required: true,
    },
    tokenAmount: {
        type: Number,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Create and export the model
const TokenPackage = (0, mongoose_1.model)("TokenPackage", tokenPackageSchema);
exports.default = TokenPackage;
