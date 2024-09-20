import { calculateCgst, calculateSgst } from "./utils";

describe("Utils", () => {
  describe("calculateSgst", () => {
    it("should calculate sgst", () => {
      expect(calculateSgst(100)).toBe(6);
    });

    it("should calculate sgst", () => {
      expect(calculateSgst(10)).toBe(0.6);
    });
  });

  describe("calculateCgst", () => {
    it("should calculate cgst", () => {
      expect(calculateCgst(100)).toBe(6);
    });

    it("should calculate cgst", () => {
      expect(calculateCgst(10)).toBe(0.6);
    });
  });
});
