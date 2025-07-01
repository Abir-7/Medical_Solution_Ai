import TokenPackage from "./tokenPackages.model";

// Function to add a new token package
const addnewPackage = async (data: { price: number; tokenAmount: number }) => {
  const isExist = await TokenPackage.findOne({
    price: data.price,
    tokenAmount: data.tokenAmount,
  });
  if (isExist) {
    return isExist;
  }
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
