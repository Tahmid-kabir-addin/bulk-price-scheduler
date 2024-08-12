const prisma = require("./database.server");
require("@shopify/shopify-api/adapters/node");
const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
require("dotenv").config();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ["read_inventory", "write_inventory", "write_products"],
  hostName: "https://aa41-103-230-104-42.ngrok-free.app:8000",
});

/**
 * Updates the status of a sale in the database.
 *
 * @param {string} saleId - The ID of the sale to be updated.
 * @param {string} status - The new status of the sale.
 * @return {Promise<void>} A promise that resolves when the update is complete.
 */
async function updateStatus(saleId, status) {
  console.log("🚀 ~ updateStatus ~ status:", status);
  try {
    await prisma.sale.update({
      where: {
        id: saleId,
      },
      data: {
        status,
      },
    });
  } catch (error) {
    console.log("🚀 ~ updateStatus ~ error:", error);
  }
}

/**
 * Updates the prices of products in Shopify based on the provided fields and session.
 *
 * @param {Array} productsWithPrice - An array of products with their current prices.
 * @param {Object} fields - An object containing the fields to update the prices with, such as action, amount, and percent.
 * @param {Object} session - The Shopify session object.
 * @param {Array} tags - An optional array of tags to add to the products after updating their prices.
 * @return {Promise<void>} A promise that resolves when the update is complete.
 */
async function updateProductsPrice(productsWithPrice, fields, session, tags = []) {
  const client = new shopify.clients.Graphql({session});
  console.log("🚀 ~ updateProductsPrice ~ fields:", fields);
  let amount = Number(fields.amount ?? 0);
  let percent = Number(fields.percent ?? 0);
  let cents = 0;
  if (fields.overrideCents) cents = Number(fields.cents);

  for (const product of productsWithPrice) {
    console.log("🚀 ~ updateProductsPrice ~ product:", product.id);
    const variants = product.variants.map((variant) => {
      if (
        fields.action === "increase_price" ||
        fields.action === "decrease_price" ||
        fields.action === "set_new_price"
      ) {
        return {
          id: variant.id,
          price: calculatePrice(
            Number(variant.price),
            percent,
            amount,
            fields.action,
            fields.overrideCents,
            cents
          ),
        };
      } else if (fields.action === "set_to_compare_at_price") {
        return {
          id: variant.id,
          price: Number(variant.compareAtPrice).toFixed(2),
        };
      } else if (fields.action === "set_margin") {
        return {
          id: variant.id,
          price: Number(variant.costPerItem) * (1 + percent / 100),
        };
      } else if (
        fields.action === "increase_compare_at_price" ||
        fields.action === "decrease_compare_at_price" ||
        fields.action === "set_new_compare_at_price"
      ) {
        let action = "increase_price";
        if (fields.action === "decrease_compare_at_price") {
          action = "decrease_price";
        } else if (fields.action === "set_new_compare_at_price") {
          action = "set_new_price";
        }
        return {
          id: variant.id,
          compareAtPrice: calculatePrice(
            variant.compareAtPrice,
            percent,
            amount,
            action,
            fields.overrideCents,
            cents
          ),
        };
      } else if (
        fields.action === "set_to_price" ||
        fields.action === "set_to_old_price_discount"
      ) {
        return {
          id: variant.id,
          compareAtPrice: variant.price,
        };
      }
      return {};
    });
    const response = await client.request(
      `#graphql
        mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            product {
              id
            }
            productVariants {
              id
              title              
            }
            userErrors {
              field
              message
            }
          }
        }`,
      {
        variables: {
          productId: product.id,
          variants,
        },
        retries: 3,
      }
    );
    console.log("🚀 ~ response:", response);
    if (tags.length > 0) {
      await shopify.graphql(
        `#graphql
        mutation addTags($id: ID!, $tags: [String!]!) {
          tagsAdd(id: $id, tags: $tags) {
            node {
              id
            }
            userErrors {
              message
            }
          }
        }`,
        {
          variables: {
            id: product.id,
            tags,
          },
        }
      );
    }
  }
}

/**
 * Rolls back a sale by retrieving the sale data, rolling back the product prices, and updating the sale status.
 *
 * @param {string} id - The ID of the sale to roll back.
 * @param {object} session - The session object used for rolling back the sale.
 * @return {object} The rolled back sale data.
 */
async function rollbackSale(id, session) {
  let sale = null;
  try {
    sale = await prisma.sale.findUnique({
      where: {
        id,
      },
      include: {
        Product: {
          include: {
            variant: true,
          },
        },
      },
    });
  } catch (error) {
    console.log("🚀 ~ rollbacksale ~ error", error);
    throw new Error(error);
  }
  try {
    await rollbackProductPrice(sale, session);
  } catch (error) {
    console.log("🚀 ~ rollbackProductPrice ~ error", error);
    throw new Error(error);
  }
  await prisma.sale.update({
    where: {
      id: id,
    },
    data: {
      status: "Completed",
    },
  });
  return sale;
}

/**
 * Rolls back the prices of products in a sale by updating the product variants in bulk.
 *
 * @param {object} sale - The sale object containing the products to roll back.
 * @param {object} session - The Shopify session object used for rolling back the sale.
 * @return {Promise<void>} A promise that resolves when the rollback is complete.
 */
async function rollbackProductPrice(sale, session) {
  const client = new shopify.clients.Graphql({session});
  try {
    for (const product of sale.Product) {
      const variants = product.variant.map((variant) => {
        return {
          id: variant.variantId,
          price: variant.previousPrice,
          compareAtPrice: variant.previousCompareAtPrice,
        };
      });
      await client.request(
        `#graphql
          mutation UpdateProductVariantsInBulk($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
            productVariantsBulkUpdate(productId: $productId, variants: $variants) {
              product {
                id
              }
              productVariants {
                id
                title              
              }
              userErrors {
                field
                message
              }
            }
          }`,
        {
          variables: {
            productId: product.productId,
            variants,
          },
        }
      );
    }
  } catch (error) {
    console.log("🚀 ~ rollbackProductPrice ~ error:", error);
    throw new Error(error);
  }
}

/**
 * Calculates the new price based on the provided action, percentage, and amount.
 *
 * @param {number} price - The initial price.
 * @param {number} percent - The percentage to apply to the price.
 * @param {number} amount - The amount to add or subtract from the price.
 * @param {string} action - The action to perform on the price (increase_price, decrease_price, set_new_price).
 * @param {boolean} overrideCents - Whether to override the cents of the price.
 * @param {number} cents - The cents to use if overrideCents is true.
 * @return {string} The new price as a string with two decimal places.
 */
const calculatePrice = (
  price,
  percent,
  amount,
  action,
  overrideCents,
  cents
) => {
  let newPrice = 0;
  if (action === "increase_price") {
    newPrice = (
      Number(price) +
      (Number(price) * percent) / 100 +
      amount
    ).toFixed(2);
  } else if (action === "decrease_price") {
    newPrice = (
      Number(price) -
      (Number(price) * percent) / 100 -
      amount
    ).toFixed(2);
  } else if (action === "set_new_price") {
    newPrice = amount.toFixed(2);
  }
  if (overrideCents) {
    const roundedPrice = Math.floor(newPrice);
    newPrice = roundedPrice + cents / 100;
  }
  return newPrice;
};
module.exports = { updateStatus, updateProductsPrice, rollbackSale };
