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
exports.TokenPackageService = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const tokenPackages_model_1 = __importDefault(require("./tokenPackages.model"));
// Function to add a new token package
const addnewPackage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield tokenPackages_model_1.default.findOne({
        price: data.price,
        tokenAmount: data.tokenAmount,
    });
    if (isExist) {
        return isExist;
    }
    const createNew = new tokenPackages_model_1.default({
        price: data.price,
        tokenAmount: data.tokenAmount,
    });
    return createNew.save();
});
const getAllTokenPackage = () => __awaiter(void 0, void 0, void 0, function* () {
    const allTokenPackage = yield tokenPackages_model_1.default.find();
    return allTokenPackage;
});
exports.TokenPackageService = { addnewPackage, getAllTokenPackage };
