import { Orders } from "../models/orders";
import { Request, Response } from "express";
import path from "path";
import puppeteer from "puppeteer";
import fs from "fs";


const sgst = 6;
const cgst = 6;

export const calculateSgst = (amount: number) => {
  return (amount * sgst) / 100;
};

export const calculateCgst = (amount: number) => {
  return (amount * cgst) / 100;
};

export const numberToWords = (num: number): string => {
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE']
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN']
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const thousands = ['', 'THOUSAND', 'LAKH', 'BILLION'];

  if (isNaN(num)) {
    throw new Error('Invalid input. Please enter a valid number.');
  }

  if (num === 0) return 'zero';

  let integerPart = Math.floor(num);
  let decimalPart = Math.round((num - integerPart) * 100);

  let result = '';
  let i = 0;
  let resultNumber = integerPart;
  while (resultNumber > 0) {
    if (resultNumber % 1000 !== 0) {
      result = helper(resultNumber % 1000) + ' ' + thousands[i] + ' ' + result;
    }
    resultNumber = Math.floor(resultNumber / 1000);
    i++;
  }

  if (decimalPart > 0) {
    result += ' RUPEES AND ' + helper(decimalPart) + ' PAISE';
  }

  return result.trim();

  function helper(num: number): string {
    if (num === 0) return '';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    return ones[Math.floor(num / 100)] + ' HUNDRED' + (num % 100 !== 0 ? ' ' + helper(num % 100) : '');
  }
};
export const generateDcPDF = async (req: Request, res: Response) => {
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

    const date = new Date(order.date.substring(0, 10));
    const formattedDate = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    const dcDate = new Date(order.party_dc_date.substring(0,10));
    const formattedDcdate = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    
    
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
  <body class="text-black font-sans text-xs pt-5">
    <div class="h-[100%] w-[100%] pt-4 ml-1 mt-10 border-white border-t">
      <div
        class="grid grid-cols-12  ml-2 h-[80%] w-[98%] mt-11  absolute left-0 top-10 bottom-0 right-0 pl-2"
      >
        <div class="col-span-1 border-r border-l border-black"></div>
        <div class="col-span-8 border-r border-black"></div>
        <div class="col-span-3 border-r border-black ml-1"></div>
      </div>

      <div
        class="ml-3 mt-1 pr-1 border-t border-l border-black relative left-0 top-0 bottom-0 w-[97%]"
      >
        <div class="bg-white border-black border-t ">
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
              class="col-span-3 text-right border-l border-black p-2 text-sm"
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
                  <div class="text-nowrap mr-2 text-xl">DC # :</div>
                  <div class="text-xl">
                  ${order.dc_no}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-3 border-l border-black">
              <div>
                <div class="p-2 flex font-bold mt-1">
                  <div class="text-nowrap mr-2">Date:</div>
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
                  class="p-2 grid grid-cols-3 border-l border-b border-black font-bold gap-x-10"
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
                <div class="p-2 flex border-l border-b border-black font-bold">
                  <div class="text-nowrap mr-3">Party GSTIN :</div>
                  <div>
                  ${order.party_gstin}
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2">
                <div class="p-2 border-black font-bold flex gap-x-2">
                  <div class="text-nowrap">Veh # :</div>
                  <div>
                  ${order.vehicle_no}
                  </div>
                </div>
                <div
                  class="p-2 grid grid-cols-3 border-l border-black font-bold gap-x-1"
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
          <div class="grid grid-cols-12 border-b border-black  text-center">
            <div class="col-span-1 p-2 font-bold">SL #</div>
            <div class="col-span-8 p-2 font-bold">PRODUCT DESCRIPTION</div>
            <div class="col-span-3  pt-2  font-bold">QTY</div>
          </div>

          <div>
            <div class="relative left-20 p-2">
              ${order.product_description}
            </div>
            ${order.items.map((item, index) => `
              <div>
                 <div class="grid grid-cols-12 text-center pt-2">
                   <div class="col-span-1">${index + 1}</div>
                   <div class="col-span-8 text-left pl-5">${item.length} x ${item.width }</div>
                   <div class="col-span-3">${item.quantity}</div>
                 </div>
               </div>
               `).join('')}
               <div class="pt-2 ml-16 pl-5">Material Value:  ${order.material_value}</div>
               <div class="pt-2 ml-16 pl-5">Total Weight:  ${order.total_weight}</div>

          </div>

          <div
            class="bg-white border border-r border-black absolute w-[100%] top-[900px] right-1 left-0"
          >
            <div class="grid grid-cols-12">
              <div
                class="p-2 col-span-7 font-bold border-l border-b border-r border-black"
              >
                <p>ALL DISPUTES SUBJECT TO CHENNAI JURISDICATION</p>
                <p>GOODS ONCE SOLD CAN#T BE TAKEN BACK</p>
                <p>
                  INTEREST WILL BE CHARGED AT 21% P.A. IF BILL #T PAID WITHIN
                  DUE DATE PLEASE PAY
                </p>
                <p>BY A/C PAYEE CHEQUE / DRAFT PAYABLE AT CHENNAI</p>
                <div class="h-16 mt-2 ml-32 text-sm ">Receiver's signature</div>
              </div>
              <div
                class="col-span-5 border-black border-r border-b flex flex-col justify-between"
              >
                <div class="mt-4 text-center">
                  For
                  <span class="font-bold">KARTHICK INDUSTRIES</span>
                </div>
                <div class="mb-4 font-bold text-center">Proprietor</div>
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
    res.download(tempFilePath, `Dc_${order.dc_no} .pdf`, (err) => {
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

