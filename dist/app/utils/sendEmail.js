"use strict";
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// import nodemailer from "nodemailer";
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
exports.sendEmail = sendEmail;
// import HttpStatus from "http-status";
// import AppError from "../errors/AppError";
// import { appConfig } from "../config";
// import logger from "./serverTools/logger";
// export async function sendEmail(email: string, subject: string, text: string) {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: appConfig.email.host,
//       port: Number(appConfig.email.port),
//       secure: false,
//       auth: {
//         user: appConfig.email.user,
//         pass: appConfig.email.pass,
//       },
//     });
//     const info = await transporter.sendMail({
//       from: `"MedicalSolution" ${appConfig.email.from}`, // Sender address
//       to: email, // Recipient's email
//       subject: `${subject}`,
//       text: text,
//       html: `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Promotional Email</title>
//           <style>
//             /* Reset styles */
//             body, html {
//               margin: 0;
//               padding: 0;
//               font-family: Arial, sans-serif;
//             }
//             /* Container styles */
//             .container {
//               max-width: 600px;
//               margin: 20px auto;
//               padding: 20px;
//               border: 1px solid #ccc;
//               border-radius: 10px;
//               background-color: #fff;
//               box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//             }
//             /* Header styles */
//             .header {
//               background-color: #caccd1; /* New blue background */
//               padding: 20px;
//               border-radius: 10px 10px 0 0;
//               color: #000000;
//               text-align: center;
//             }
//             .header h1 {
//               margin: 0;
//             }
//             /* Content styles */
//             .content {
//               padding: 20px;
//               text-align: left;
//               font-size: 16px;
//               line-height: 1.6;
//               color: #333;
//             }
//             /* Footer styles */
//             .footer {
//               background-color: #caccd1; /* New green background */
//               padding: 15px;
//               border-radius: 0 0 10px 10px;
//               text-align: center;
//               color: #000000;
//               font-size: 12px;
//             }
//             /* Button styles */
//             .btn {
//               display: inline-block;
//               padding: 10px 20px;
//               margin-top: 10px;
//               background-color: #FF6600;
//               color: #fff;
//               text-decoration: none;
//               border-radius: 5px;
//               font-weight: bold;
//             }
//             /* Responsive styles */
//             @media (max-width: 600px) {
//               .container {
//                 padding: 10px;
//               }
//               .content {
//                 font-size: 14px;
//               }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>${subject}</h1>
//             </div>
//             <div class="content">
//               <p>${text}</p>
//             </div>
//             <div class="footer">
//               <p>&copy; ${new Date().getFullYear()} MedicalSolution. All rights reserved.</p>
//             </div>
//           </div>
//         </body>
//         </html>
//       `,
//     });
//     return info;
//   } catch (error: any) {
//     logger.error("Error sending email", error);
//     throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, "Error sending email");
//   }
// }
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const nodemailer_1 = __importDefault(require("nodemailer"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const config_1 = require("../config");
const logger_1 = __importDefault(require("./serverTools/logger"));
function sendEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ to, subject, code, projectName = "RedactorApp", expireTime = 10, purpose = "Verification", // default if not provided
     }) {
        try {
            const transporter = nodemailer_1.default.createTransport({
                host: config_1.appConfig.email.host,
                port: Number(config_1.appConfig.email.port),
                secure: false,
                auth: {
                    user: config_1.appConfig.email.user,
                    pass: config_1.appConfig.email.pass,
                },
            });
            const html = `
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #eef2f7;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 480px;
      margin: 50px auto;
      padding: 40px 30px;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      text-align: center;
      color: #333333;
    }
    h1 {
      font-size: 26px;
      margin-bottom: 10px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      margin: 12px 0;
    }
    .code {
      display: inline-block;
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: #ffffff;
      padding: 14px 28px;
      border-radius: 8px;
      margin: 20px 0;
      letter-spacing: 2px;
    }
    .footer {
      margin-top: 25px;
      font-size: 13px;
      color: #888888;
    }
    .footer a {
      color: #888888;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${purpose} Code</h1>
    <p>Use the code below to ${purpose.toLowerCase()} for your <strong>${projectName}</strong> account.</p>
    <div class="code">${code}</div>
    <p>This code expires in ${expireTime} minutes.</p>

  </div>
</body>
</html>
`;
            const info = yield transporter.sendMail({
                from: `"${projectName}" <${config_1.appConfig.email.from}>`,
                to,
                subject,
                html,
            });
            return info;
        }
        catch (error) {
            logger_1.default.error("Error sending email", error);
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Error sending email");
        }
    });
}
