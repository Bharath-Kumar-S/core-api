import request, { Response } from "supertest";
import { app, server } from "../index";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { postorder } from "./mocks/orders";

// Combined describe blocks for healthcheck and orders
describe("API Endpoints", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
    server.close();
  });

  describe("GET /api/healthcheck", () => {
    it("should return 200 OK", async () => {
      const response: Response = await request(app).get("/api/healthcheck");
      expect(response.status).toBe(200);
    });
  });

  describe("Post /orders", () => {
    const date = "22/07/24";
    it("should return 200 OK", async () => {
      const response: Response = await request(app)
        .post("/orders")
        .send(postorder({ date, party_dc_date: date }));
      expect(response.status).toBe(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body).toHaveProperty("createdAt");
      expect(response.body).toMatchObject({
        to: "100",
        e_way_no: "300",
        party_dc_no: "1",
        party_dc_date: date,
        date,
        party_gstin: "22ABCDE1234F2Z5",
        hsn_code: "998898666",
        product_description: "345",
        items: [
          {
            quantity: 45,
            meta_data: {
              length: 5,
              width: 235,
            },
            material_value: "45000",
            rate: 0.15,
            image: "jhvjb,j",
          },
          {
            quantity: 123,
            meta_data: {
              length: 15,
              width: 35,
            },
            material_value: "5000",
            rate: 1,
            image: "hgcjhgcjhyc",
          },
        ],
        vehicle_no: "455",
        total_weight: "333",
        handling_charges: 0.5,
        cgst: 6,
        sgst: 6,
      });
    });
  });

  describe("GET /orders", () => {
    it("should return 200 OK with 1 order", async () => {
      const response: Response = await request(app).get("/orders");
      expect(response.status).toBe(200);
      expect(response.body.total).toStrictEqual(1);
    });

    it("add a order and assert total", async () => {
      const date = "23/07/24";
      const response: Response = await request(app)
        .post("/orders")
        .send(postorder({ date, party_dc_date: date }));
      expect(response.status).toBe(201);

      const response2: Response = await request(app).get("/orders");
      expect(response2.status).toBe(200);
      expect(response2.body.total).toStrictEqual(2);
    });
  });

  describe("order/:id", () => {
    it("should filter by dc_no", async () => {
      const response2: Response = await request(app).get("/orders/1");
      expect(response2.status).toBe(200);
      expect(response2.body.dc_no).toStrictEqual(1);
    });

    it("should filter by another dc_no", async () => {
      const response2: Response = await request(app).get("/orders/2");
      expect(response2.status).toBe(200);
      expect(response2.body.dc_no).toStrictEqual(2);
    });
  });
});
