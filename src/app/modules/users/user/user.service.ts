import { myDataSource } from "../../../db/database";
import { User } from "./user.entity";
import fs from "fs";
import path from "path";
import { Document, Packer, Paragraph, TextRun } from "docx";
import * as dotenv from "dotenv";
import { appConfig } from "../../../config";
import { UserToken } from "../../userToken/userToken.entity";

dotenv.config();

const getAllUser = async () => {
  const userRepo = myDataSource.getRepository(User);
  const users = await userRepo.find();

  return users;
};

const downloadDataInDoc = async () => {
  const userRepo = myDataSource.getRepository(User);
  const users = await userRepo.find();

  // Create a single section with all content
  const section = {
    properties: {},
    children: [
      // Title paragraph
      new Paragraph({
        children: [
          new TextRun("All User Profiles"),
          new TextRun({
            text: " - All data of registered users",
            bold: true,
          }),
        ],
        spacing: {
          after: 200, // Add some space after title
        },
      }),
      // Add all user paragraphs
      ...users.flatMap((user) => {
        const { userProfile } = user;
        const fullName = userProfile.fullName;
        const specialty = userProfile.specialty;
        const phone = userProfile.phone || "N/A";
        const country = userProfile.country || "N/A";
        const image = userProfile.image || "N/A";

        return [
          // User Profile Heading
          new Paragraph({
            children: [
              new TextRun(`User: ${fullName}`),
              new TextRun({ text: ` (${specialty})`, bold: true }),
            ],
            spacing: {
              after: 100,
            },
          }),

          // User Details
          new Paragraph({
            children: [
              new TextRun(`Full Name: ${fullName}`),
              new TextRun(`\nSpecialty: ${specialty}`),
              new TextRun(`\nPhone: ${phone}`),
              new TextRun(`\nCountry: ${country}`),
              new TextRun(`\nImage: ${image}`),
            ],
            spacing: {
              after: 200, // Add more space after each user block
            },
          }),
        ];
      }),
    ],
  };

  const doc = new Document({
    sections: [section], // Single section containing all content
  });

  // Generate the document and save it
  const fileName = `all_users_data-${new Date().toISOString()}.docx`;
  const filePath = path.join(process.cwd(), "uploads", "downloads", fileName);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);

  return `${appConfig.server.baseurl}/downloads/${fileName}`;
};

export const UserService = { getAllUser, downloadDataInDoc };
