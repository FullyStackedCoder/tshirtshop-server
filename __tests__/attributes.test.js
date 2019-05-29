import axios from "axios";

describe("attribute resolvers", () => {
  it("allAttributeValues", async () => {
    const response = await axios.post("http://localhost:4000/graphql", {
      query: `
      query {
        allAttributeValues {
          value
        }
      }
      `
    });
    const { data } = response;
    expect(data).toMatchObject({
      data: {
        allAttributeValues: [
          {
            value: "S"
          },
          {
            value: "M"
          },
          {
            value: "L"
          },
          {
            value: "XL"
          },
          {
            value: "XXL"
          },
          {
            value: "White"
          },
          {
            value: "Black"
          },
          {
            value: "Red"
          },
          {
            value: "Orange"
          },
          {
            value: "Yellow"
          },
          {
            value: "Green"
          },
          {
            value: "Blue"
          },
          {
            value: "Indigo"
          },
          {
            value: "Purple"
          }
        ]
      }
    });
  });
});
