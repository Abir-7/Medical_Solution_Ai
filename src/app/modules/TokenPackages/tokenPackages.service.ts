/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import TokenPackage from "./tokenPackages.model"; // Import your Mongoose model

// Function to add a new token package
const addnewPackage = async (data: { price: number; tokenAmount: number }) => {
  const createNew = new TokenPackage({
    price: data.price,
    tokenAmount: data.tokenAmount,
  });

  return createNew.save();
};

const getAllTokenPackage = async () => {
  const allTokenPackage = await TokenPackage.find();
  return allTokenPackage;
};

export const TokenPackageService = { addnewPackage, getAllTokenPackage };
