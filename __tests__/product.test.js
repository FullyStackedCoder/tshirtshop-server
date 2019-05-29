import axios from "axios";
import { pageOneProducts, searchResultProducts, priceRangeProducts } from "../mocks/productMocks";

describe("product resolvers", () => {
  it("returns 12 products for first page", async () => {
    const response = await axios.post("http://localhost:4000/graphql", {
      query: `
      query {
        products(limit: 12, offset: 0, departments: [1,2,3], categories: [1,2,3,4,5,6,7],
          searchTerm: "", attributeValues: [], minPrice: 12, maxPrice: 22) {
          product_id
          name
          description
          price
          discounted_price
          }
        }
      `
    });
    const { data } = response;
    expect(data).toMatchObject({
      data: pageOneProducts
    });
  });
  it('returns 3 products when searched for word italia', async () => {
    const response = await axios.post("http://localhost:4000/graphql", {
      query: `
      query {
        products(limit: 12, offset: 0, departments: [1,2,3], categories: [1,2,3,4,5,6,7],
          searchTerm: "italia", attributeValues: [], minPrice: 12, maxPrice: 22) {
          product_id
          name
          description
          price
          discounted_price
          }
        }
      `
    });
    const { data } = response;
    expect(data).toMatchObject({
      data: searchResultProducts
    });
  })
  it('returns 11 products when price range selected is $12 and $13', async () => {
    const response = await axios.post("http://localhost:4000/graphql", {
      query: `
      query {
        products(limit: 12, offset: 0, departments: [1,2,3], categories: [1,2,3,4,5,6,7],
          searchTerm: "", attributeValues: [], minPrice: 12, maxPrice: 13) {
          product_id
          name
          description
          price
          discounted_price
          }
        }
      `
    });
    const { data } = response;
    expect(data).toMatchObject({
      data: priceRangeProducts
    });
  })
});
