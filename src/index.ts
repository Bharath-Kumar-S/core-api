import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { postSubscriber } from "./controller/subscribeController";
import { orderRouter } from "./router/order";
import fs from "fs";
import puppeteer from "puppeteer";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT === undefined ? 5001 : process.env.PORT;

app.use(express.json());
app.use(cors());

app.get("/health-check", (req, res) => {
  res.send({
    status: "OK",
  });
});

app.get("/api/healthcheck", (re, res) => {
  res.status(200).send("OK");
});
app.post("/subscribe", postSubscriber);
app.use("/orders", orderRouter);
app.get("/api/pdf", async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlContent = `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        h1 {
            text-align: center;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 10px;
        }
        .header, .footer {
            text-align: center;
            margin: 20px 0;
        }
        .details, .items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .details td, .items td, .items th {
            border: 1px solid #eee;
            padding: 10px;
        }
        .items th {
            background: #f2f2f2;
        }
        .total {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <h1>Invoice</h1>
        <div class="header">
            <h2>Company Name</h2>
            <p>Company Address</p>
            <p>Phone: (123) 456-7890</p>
            <p>Email: info@company.com</p>
        </div>
        <div class="details">
            <table>
                <tr>
                    <td><strong>Invoice Number:</strong> 12345</td>
                    <td><strong>Date:</strong> 2024-09-20</td>
                </tr>
                <tr>
                    <td><strong>Bill To:</strong></td>
                    <td><strong>Ship To:</strong></td>
                </tr>
                <tr>
                    <td>Customer Name</td>
                    <td>Customer Address</td>
                </tr>
                <tr>
                    <td>City, State, Zip</td>
                    <td>City, State, Zip</td>
                </tr>
            </table>
        </div>
        <table class="items">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Product 1</td>
                    <td>2</td>
                    <td>$10.00</td>
                    <td>$20.00</td>
                </tr>
                <tr>
                    <td>Product 2</td>
                    <td>1</td>
                    <td>$15.00</td>
                    <td>$15.00</td>
                </tr>
                <tr>
                    <td class="total" colspan="3">Subtotal</td>
                    <td class="total">$35.00</td>
                </tr>
                <tr>
                    <td class="total" colspan="3">Tax (10%)</td>
                    <td class="total">$3.50</td>
                </tr>
                <tr>
                    <td class="total" colspan="3">Total</td>
                    <td class="total">$38.50</td>
                </tr>
            </tbody>
        </table>
        <div class="footer">
            <p>Thank you for your business!</p>
        </div>
    </div>
</body>
</html>
  `;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  // Save PDF to a temporary file
  const tempFilePath = path.join(__dirname, "temp.pdf");
  fs.writeFileSync(tempFilePath, pdfBuffer);

  // Use res.download() to send the file
  res.download(tempFilePath, "output.pdf", (err) => {
    if (err) {
      console.error(err);
    }
    // Optionally delete the temporary file
    fs.unlinkSync(tempFilePath);
  });
});

const server = app.listen(PORT, async () => {
  console.log(
    `⚡️⚡️⚡️[server]: Server is running at https://localhost:${PORT} ⚡️⚡️⚡️`
  );
  try {
    console.log("app is started");
    if (!(process.env.NODE_ENV === "test")) {
      mongoose.connect(`${process.env.DBSTRING}`);
      const db = mongoose.connection;
      db.on("error", (err) => {
        console.error(err);
      });
      db.on("open", () => console.log("Connected to DB!!!!"));
    }
  } catch (err) {
    console.log(err);
  }
});

export { app, server };
