import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from "html-to-pdfmake";
import { JSDOM } from "jsdom";
import { OrderType } from "../types/Order";

// Register the fonts (Roboto built-in fonts in vfs)
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const createPdf = (order: OrderType) => {
  try {
    // Use jsdom to create a virtual DOM for html-to-pdfmake
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    const { window } = dom;

    // Convert the HTML content to pdfMake format
    const pdfContent = htmlToPdfmake(
      `
        <div>
          <h1>${order.to}</h1>
          <p>
            This is a sentence with a <strong>bold word</strong>, <em>one in italic</em>,
            and <u>one with underline</u>. And finally <a href="https://www.somewhere.com">a link</a>.
          </p>
        </div>
      `,
      { window }
    );

    // Define the document structure for pdfMake
    const docDefinition = {
      content: pdfContent,
      defaultStyle: {
        font: "Roboto", // Use Roboto font as default
      },
    };

    // Return the pdfMake instance
    return pdfMake.createPdf(docDefinition);
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
};
