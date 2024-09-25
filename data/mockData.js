const { faker } = require("@faker-js/faker");
const address = faker.location;

const getMockOrder = () => {
  return {
    to: `${address.buildingNumber()} ${address.streetAddress()} ${address.city()} ${address.country()}`,
    e_way_no: faker.number.int({
      max: 1000000000000000,
    }),
    date:faker.date.anytime(),
    party_dc_no: faker.number.int({min:1,max:100000}),
    party_dc_date: faker.date.anytime(),
    party_gstin:faker.internet.mac(),
    hsn_code:faker.number.int({min:10000,max:10000000}),
    product_description:faker.word.words({count:8}),
    items: [
      {
        quantity:faker.number.int({min:100,max:1000}),
        meta_data: {
          length:faker.number.int({min:100,max:500}),
          width: faker.number.int({min:100,max:500}),
        },
        material_value: faker.number.int({min:1000,max:50000}),
        rate:faker.number.int({min:100,max:500}),
        image: faker.word.words({count:2}),
      },
      {
        quantity: 123,
        meta_data: {
          length: 15,
          width: 35,
        },
        material_value:faker.number.int({min:100,max:1000}),
        total_weight: 100,
        rate: 1,
        image: "hgcjhgcjhyc",
      },
    ],
    vehicle_no: faker.internet.mac().replace(/:/g, "-"),
    total_weight:faker.number.int({min:100,max:1000}),
    handling_charges: faker.number.int({min:50,max:100}),
    cgst: 6,
    sgst: 6,
  };
};

module.exports = { getMockOrder };
