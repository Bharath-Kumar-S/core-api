export type OrderType = {
  to: any;
  e_way_no: String;
  dc_no: Number;
  invoice_no: Number;
  date: String;
  party_dc_no: Number;
  party_dc_date: String;
  party_gstin: String;
  hsn_code: "998898" | "997212" | "73084000";
  product_description: String;
  items: [
    {
      meta_data: {
        length: Number;
        width: Number;
      };
      quantity: Number;
      material_value: Number;
      total_weight: Number;
      rate: Number;
      amount: Number;
      image: String;
    }
  ];
  vehicle_no: String;
  handling_charges: Number;
  cgst: Number;
  sgst: Number;
  net_total: Number;
  gross_total: Number;
  total_weight?: Number;
};
