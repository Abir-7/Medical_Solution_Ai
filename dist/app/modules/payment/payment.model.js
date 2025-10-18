"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const payment_interface_1 = require("./payment.interface"); // Rename to avoid conflict
const paymentSchema = new mongoose_1.Schema({
    txId: { type: String, default: null },
    priceAtBuyTime: { type: Number, required: true },
    tokenPackageId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "TokenPackage",
        required: true,
    },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
        type: String,
        enum: Object.values(payment_interface_1.PaymentStatus),
        default: payment_interface_1.PaymentStatus.UNPAID,
    },
    referenceCode: { type: String, required: true },
}, { timestamps: true });
paymentSchema.index({ createdAt: 1 }); // for date-based queries
paymentSchema.index({ user: 1 }); // for user-specific lookups
const Payment = (0, mongoose_1.model)("Payment", paymentSchema);
exports.default = Payment;
