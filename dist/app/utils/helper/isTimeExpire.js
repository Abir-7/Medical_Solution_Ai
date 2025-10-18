"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTimeExpired = void 0;
const isTimeExpired = (expiryTime) => {
    const now = new Date();
    const expiryDate = typeof expiryTime === "string" ? new Date(expiryTime) : expiryTime;
    // If expiryDate is invalid, consider expired (optional)
    if (isNaN(expiryDate === null || expiryDate === void 0 ? void 0 : expiryDate.getTime())) {
        return true;
    }
    return expiryDate <= now;
};
exports.isTimeExpired = isTimeExpired;
