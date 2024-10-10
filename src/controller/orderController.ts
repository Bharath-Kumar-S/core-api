import { calculateCgst, numberToWords } from '../utils/utils';
import { Orders } from "../models/orders";
import { Request, Response } from "express";
import { calculateSgst } from "../utils/utils";
import { OrderType } from "../types/Order";
import path from "path";
import puppeteer from "puppeteer";
import fs from "fs";

export const postOrder = async (req: Request, res: Response) => {
  const {
    to,
    e_way_no,
    party_gstin,
    hsn_code,
    product_description,
    items,
    vehicle_no,
    handling_charges,
    cgst,
    sgst,
    total_weight,
    party_dc_date,
    material_value,
    date,
  } = req.body;

  const values = {
    to,
    e_way_no,
    party_gstin,
    hsn_code,
    product_description,
    items,
    vehicle_no,
    handling_charges,
    cgst,
    sgst,
    total_weight,
    material_value
  };

  const dc_no = (await Orders.estimatedDocumentCount()) + 1;
  const invoice_no = dc_no;
  const party_dc_no = dc_no;
  const calculatedItems = items.map(
    (item: { quantity: number; rate: number }) => {
      return {
        ...item,
        amount: item.quantity * item.rate,
      };
    }
  );

  const net_total = calculatedItems.reduce(
    (acc: any, cur: { amount: number }) => {
      return acc + cur.amount;
    },
    0
  )+handling_charges;
  const calculatedSgst = calculateSgst(net_total);
  const calculatedCgst = calculateCgst(net_total);
  const gross_total = net_total + calculatedSgst + calculatedCgst;

  const updatedValues: OrderType = {
    ...values,
    dc_no,
    invoice_no,
    party_dc_no,
    party_dc_date,
    date,
    items: calculatedItems,
    sgst, calculatedSgst,
    cgst, calculatedCgst,
    gross_total,
    net_total,
    material_value
  };

  for (let key in updatedValues) {
    // @ts-ignore
    if (!updatedValues[key]) {
      return res.status(400).json({ message: `${key} is required` });
    }
  }

  try {
    const order = await Orders.create({
      to,
      e_way_no,
      party_gstin,
      hsn_code,
      product_description,
      items: calculatedItems,
      material_value,
      vehicle_no,
      handling_charges,
      cgst,
      sgst,
      dc_no,
      invoice_no,
      party_dc_no,
      party_dc_date,
      date,
      net_total,
      calculatedSgst,
      calculatedCgst,
      gross_total,
      total_weight,
    });
    return order ? res.status(201).send(order) : res.status(400).send("Error");
  } catch (err) {
    //@ts-ignore
    return res.status(400).json({ message: err });
  }
};

// @desc Get all orders
// @route GET /orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = req.query;

    // Determine if a search query is present
    const hasSearch = search && typeof search === "string" && search.trim() !== "";

    if (hasSearch) {
      // Handle Search: Return all matching orders without pagination
      const searchTerm = search.trim();
      const searchNumber = Number(searchTerm);

      // Build the search query
      let query = {};

      if (!isNaN(searchNumber)) {
        // If search is a number, search both 'to' field and 'dc_no'
        query = {
          $or: [
            // { to: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on 'to' field
            { dc_no: searchNumber }, // Exact match on 'dc_no' if search is a number
          ],
        };
      } else {
        // If search is not a number, search only the 'to' field
        query = {
          to: { $regex: searchTerm, $options: "i" }, // Case-insensitive search
        };
      }

      // Fetch all matching orders
      const orders = await Orders.find(query)
        .sort({ dc_no: 1 }) // Optional: Sort by date descending
        .lean();

      // Construct response data
      const data = {
        page: 1,
        total: orders.length,
        totalPages: 1,
        orders,
      };

      return res.status(200).json(data);
    } else {
      // Handle Pagination: Return paginated orders
      const pageNumber = parseInt(page as string, 10) || 1;
      const limitNumber = parseInt(limit as string, 10) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      // Fetch total count
      const total = await Orders.countDocuments();

      // Calculate total pages
      const totalPages = Math.ceil(total / limitNumber);

      // Fetch paginated orders
      const orders = await Orders.find()
        .sort({ dc_no: 1 }) // Optional: Sort by date descending
        .skip(skip)
        .limit(limitNumber)
        .lean();

      // Construct response data
      const data = {
        page: pageNumber,
        total,
        totalPages,
        orders,
      };

      return res.status(200).json(data);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// @desc Fetch order
// @route GET /order/:dc_no
export const getOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await Orders.findOne({ dc_no: id });
  order
    ? res.status(200).json(order)
    : res.status(400).json({ message: "Invalid dc_no received" });
};

export const generatePDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch the order using the provided dc_no
    console.log("Fetching order...");
    const order = await Orders.findOne({ dc_no: id });
    

    // If no order is found, return 400 error
    if (!order) {
      return res.status(400).json({ message: "Invalid dc_no received" });
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const grossTotal: number = Number(order.gross_total);

    const date = new Date(order.date.substring(0, 10));
    const formattedDate = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    const dcDate = new Date(order.party_dc_date.substring(0,10));
    const formattedDcdate = dcDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    
    
    const htmlContent = `
   <!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdn.tailwindcss.com"></script>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
    />
  </head>
  <body class="text-black font-sans text-xs pl-1">

    <div class = "mt-14">
      <div
        class="grid grid-cols-12 h-[75%] w-[98%] mt-14  absolute left-0 top-0 bottom-0 right-0 pl-3"
      >
        <div class="col-span-1 border-r border-l border-black"></div>
        <div class="col-span-7 border-r border-black"></div>
        <div class="col-span-1 border-r border-black"></div>
        <div class="col-span-1 border-r border-black"></div>
        <div class="col-span-2 border-r border-black"></div>
      </div>

      <div
        class="ml-2 mt-9 pr-1 border-t border-l  border-black relative left-0 top-0 bottom-0 w-[97%]"
      >
        <div class="bg-white border-black border-t">
          <div class="grid grid-cols-12 border-b border-black">
            <div class="col-span-3 border-r border-black p-2">
              <h1 class="font-bold text-lg">GSTIN:</h1>
              <p class="text-sm font-bold">33AQMPS2845P1Z3</p>
            </div>
            <div class="col-span-6 text-center">
              <h1 class="text-2xl font-bold mt-2">KARTHICK INDUSTRIES</h1>
              <p class="text-sm font-bold">
                #.8, BALAJI NAGAR, (Opp. Sted Ford Hospital), Ambattur, CHENNAI
                - 600053
              </p>
            </div>
            <div
              class="col-span-3 text-right border-l  border-black p-2 text-sm"
            >
              <h1 class="font-bold">Mobile:</h1>
              <p>9566109182</p>
              <p>9444879262</p>
              <p>9087039626</p>
            </div>
          </div>

          <div class="grid grid-cols-12 border-b border-black">
            <div class="col-span-9">
              <div>
                <div class="p-2 flex font-bold">
                  <div class="text-nowrap mr-2 text-xl">Invoice #:</div>
                  <div class="text-xl">
                  ${order.invoice_no}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-3 border-l border-black ">
              <div>
                <div class="p-2 flex font-bold mt-1">
                  <div class="text-nowrap mr-2 ">Date:</div>
                  <div>
                  ${formattedDate}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-12 border-b border-black">
            <div class="col-span-6 border-r border-black">
              <div class="p-2 flex text-lg font-semibold">
                <div class="text-nowrap mr-3">To:</div>
                <div class="text-sm mt-1">
                ${order.to}
                </div>
              </div>
            </div>
            <div class="col-span-6">
              <div class="grid grid-cols-2">
                <div
                  class="p-2 grid grid-cols-3 border-b border-black font-bold gap-x-2"
                >
                  <div class="text-nowrap col-span-1">Eway # :</div>
                  <div class="col-span-2 text-wrap break-words">
                  ${order.e_way_no}
                  </div>
                </div>
                <div
                  class="p-2 grid grid-cols-3 border-l  border-b border-black font-bold gap-x-10"
                >
                  <div class="text-nowrap col-span-1">Party DC #:</div>
                  <div class="col-span-2 break-words">
                  ${order.party_dc_no}
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2">
                <div
                  class="p-2 flex gap-x-1 border-b border-black font-bold"
                >
                  <div class="text-nowrap mr-2">Party Date:</div>
                  <div>
                  ${formattedDcdate}
                  </div>
                </div>
                <div class="p-2 flex border-l border-b border-black font-bold ">
                  <div class="text-nowrap mr-3">Party GSTIN:</div>
                  <div>
                  ${order.party_gstin}
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2">
                <div class="p-2 border-black font-bold flex gap-x-3">
                  <div class="text-nowrap">Our DC #:</div>
                  <div>
                  ${order.dc_no}
                  </div>
                </div>
                <div
                  class="p-2 grid grid-cols-3 border-l border-black font-bold gap-x-1 "
                >
                  <div class="text-nowrap col-span-1">HSN #:</div>
                  <div class="col-span-2 break-words">
                  ${order.hsn_code}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="grid grid-cols-12 border-b border-black text-center ">
            <div class="col-span-1 p-2 font-bold">SL #</div>
            <div class="col-span-7 p-2 font-bold">PRODUCT DESCRIPTION</div>
            <div class="col-span-1 p-2 font-bold">QTY</div>
            <div class="col-span-1 p-2 font-bold">RATE</div>
            <div class="col-span-2 p-2 font-bold ">AMOUNT</div>
          </div>
          <div>
            <div class="relative left-20 p-2">
              ${order.product_description}
            </div>
            ${order.items.map((item, index) => `
              <div>
                 <div class="grid grid-cols-12 pt-1 text-center">
                   <div class="col-span-1 ">${index + 1}</div>
                   <div class="col-span-7 text-left pl-5 ">${item.meta_data.length} x ${item.meta_data.width }</div>
                   <div class="col-span-1 ">${item.quantity}</div>
                   <div class="col-span-1 "> ₹ ${item.rate}</div>
                   <div class="col-span-2 "> ₹ ${item.amount}</div>
                 </div>
               </div>
               `).join('')}
               <div class = "grid grid-cols-12 text-center">
               <div class="col-span-10 p-1 text-left ml-16 pl-5">Handling Charges</div>
               <div class="col-span-2 p-1">₹ ${order.handling_charges}
                </div>
          </div>
          <div
            class="bg-white border border-r border-black absolute w-[100%] top-[850px] right-0 left-0"
          >
            <div class="grid grid-cols-12 border-b border-black">
              <div class="p-1 col-span-8 border-r border-black font-bold">
                <p class="font-bold text-indigo-400 text-sm">BANK DETAILS:</p>
                <p class="text-sm">A/C #: 1452315146,</p>
                <p class="text-sm">BANK NAME: CENTRAL BANK OF INDIA</p>
                <p class="text-sm">BRANCH: NANDAMBAKKAM, CHENNAI - 600089</p>
                <p class="text-sm">IFSC CODE: CBIN0282740</p>
              </div>
              <div class="col-span-4">
                <div class="grid grid-cols-2">
                  <div class="p-2 border-r border-b border-black font-bold">
                    NET TOTAL
                  </div>
                  <div
                    class="p-2 border-b border-black text-center font-bold"
                  >
                   ₹ ${order.net_total}
                    </div>
                </div>
                <div class="grid grid-cols-2">
                  <div
                    class="p-2 flex border-r border-b border-black font-bold"
                  >
                    <div class="text-nowrap mr-2">CGST :</div>
                    <div>
                    ${order.cgst} %
                    </div>
                  </div>
                  <div
                    class="p-2 border-b border-black text-center font-bold"
                  >
                 ₹ ${order.calculatedCgst}
                    </div>
                </div>
                <div class="grid grid-cols-2">
                  <div
                    class="p-2 flex border-r border-b border-black font-bold"
                  >
                    <div class="text-nowrap mr-2">SGST :</div>
                    <div>
                    ${order.sgst} %
                    </div>
                  </div>
                  <div
                    class="p-2 border-b border-black text-center font-bold"
                  >
                  ₹ ${order.calculatedSgst}
                    </div>
                </div>
                <div class="grid grid-cols-2">
                  <div class="p-2 border-r border-black font-bold">
                    GROSS TOTAL
                  </div>
                  <div class="p-2 text-center font-bold">
                 ₹ ${order.gross_total}
                  </div>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-12 text-sm">
              <div class="col-span-7 p-2 border-r border-black">
                <div class="font-bold">
                  <div>AMOUNT IN WORDS</div>
                  <div class="text-xl"> ${numberToWords(grossTotal)} </div>
                </div>
              </div>
              <div class="col-span-5 p-2 text-center">
                <div class="text-center">
                  For
                  <span class="font-bold">KARTHICK INDUSTRIES</span>
                </div>
                <div class="mt-10 font-bold text-center">Proprietor</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
  `;

    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      // width:'8.20in',
      // height:'10.50in'
    });

    await browser.close();

    // Save PDF to a temporary file
    const tempFilePath = path.join(__dirname, "temp.pdf");
    fs.writeFileSync(tempFilePath, pdfBuffer);

    // Use res.download() to send the file
    res.download(tempFilePath, `Invoice_${order.invoice_no}.pdf`, (err) => {
      if (err) {
        console.error(err);
      }
      // Optionally delete the temporary file
      fs.unlinkSync(tempFilePath);
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};
