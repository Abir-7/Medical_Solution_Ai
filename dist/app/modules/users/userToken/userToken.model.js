"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Define the Mongoose schema for UserToken
const userTokenSchema = new mongoose_1.Schema({
    token: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
});
// Create and export the model
const UserToken = (0, mongoose_1.model)("UserToken", userTokenSchema);
exports.default = UserToken;
