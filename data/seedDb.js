const { getMockOrder } = require("./mockData");

const createOrder = async () => {
  try {
    const response = await fetch(" http://localhost:5001/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getMockOrder()),
    });

    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.log("Error creating order");
    console.log(err);
    throw err;
  }
};

(async () => {
  console.log("Creating order");
  for (let i = 0; i < 10; i++) {
    await createOrder();
  }
  console.log("Order created");
})();
