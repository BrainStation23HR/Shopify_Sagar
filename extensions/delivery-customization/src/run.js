/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const operations = [];

  for (const group of input.cart.deliveryGroups) {
    const { city, zip, countryCode } = group.deliveryAddress;

    let customPrice = null;

    // ✅ Example pricing logic
    if (city === "Dhaka") {
      customPrice = 3000; // 30.00 BDT
    } else if (city === "Chittagong") {
      customPrice = 5000; // 50.00 BDT
    } else if (city === "Sylhet") {
      customPrice = 7000; // 70.00 BDT
    } else {
      customPrice = 10000; // 100.00 BDT
    }

    for (const option of group.deliveryOptions) {
      operations.push({
        update: {
          deliveryOptionHandle: option.handle,
          title: `Shipping to ${city}`,
          price: {
            amount: 5000,
            currencyCode: "BDT",
          },
        },
      });

    }
  }

  return { operations };
}
