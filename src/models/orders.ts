import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    dc_no: {
      type: Number,
      required: [true, "Dc.no is required"],
      unique: true,
      
    },
    invoice_no: {
      type: Number,
      required: [true, "Invoice no is required"],
      unique: true,
    },
    to: {
      type: String,
      required: [true, "To address is required"],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    e_way_no: {
      type: String,
      required: [true, "Eway no is required"],
    },
    party_dc_no: {
      type: String,
      required: [true, "Party dc no required"],
    },
    party_dc_date: {
      type: String,
      required: [true, "Dc_date is required"],
    },
    party_gstin: {
      type: String,
      required: [true, "Gstin is required"],
    },
    hsn_code: {
      type: String,
      enum: ["998898", "997212", "73084000"],
    },
    product_description: {
      type: String,
      required: [true, "Product_description is required"],
    },
    items: [
      {
        item_name: {
          type: String,
        },
        meta_data: {
          length: {
            type: Number,
          },
          width: {
            type: Number,
          },
          height: {
            type: Number,
          },
        },
        quantity: {
          type: Number,
        },
        material_value: {
          type: String,
        },
        total_weight: {
          type: String,
        },
        rate: {
          type: Number,
        },
        amount: {
          type: Number,
        },
        image: {
          type: String,
        },
      },
    ],
    vehicle_no: {
      type: String,
      required: [true, "Vechicle no is required"],
    },
    handling_charges: {
      type: Number,
      required: [true, "handling_charges is required"],
    },
    net_total: {
      type: Number,
      required: [true, "net_total is required"],
    },
    cgst: {
      type: Number,
      required: [true, "cgst is required"],
    },
    sgst: {
      type: Number,
      required: [true, "sgst is required"],
    },
    gross_total: {
      type: Number,
      required: [true, "gross_total is required"],
    },
  },
  { timestamps: true }
);

export const Orders = mongoose.model("Orders", orderSchema);
