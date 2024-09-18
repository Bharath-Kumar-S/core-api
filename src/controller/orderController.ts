import { Orders } from "../models/orders";
import { Request, Response } from "express";

export const postOrder = async (req: Request, res: Response) => {
  const {
    to,
    e_way_no,
    party_dc_no,
    party_dc_date,
    party_gstin,
    hsn_code,
    product_description,
    items,
    vehicle_no,
    handling_charges,
    cgst,
    sgst,
  } = req.body;

  console.log(
    to,
    e_way_no,
    party_dc_no,
    party_dc_date,
    party_gstin,
    hsn_code,
    product_description,
    items,
    vehicle_no,
    handling_charges,
    cgst,
    sgst
  );
  return res.status(200).send({ message: "Successfull" });
};
