import { myDataSource } from "../../db/database";
import { TokenPackage } from "./tokenPackages.entity";

const addnewPackage = async (data: { price: number; tokenAmount: number }) => {
  const tokenPackageRepo = myDataSource.getRepository(TokenPackage);
  const createNew = tokenPackageRepo.create({
    price: data.price,
    tokenAmount: data.tokenAmount,
  });

  return await tokenPackageRepo.save(createNew);
};

const getAllTokenPackage = async () => {
  const tokenPackageRepo = myDataSource.getRepository(TokenPackage);

  return await tokenPackageRepo.find({
    relations: ["paymentData"],
  });
};

export const TokenPackageService = { addnewPackage, getAllTokenPackage };
