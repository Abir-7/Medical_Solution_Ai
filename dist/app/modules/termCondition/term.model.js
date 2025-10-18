"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const termsAndConditionsSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
const TermsAndConditions = (0, mongoose_1.model)("TermsAndConditions", termsAndConditionsSchema);
exports.default = TermsAndConditions;
