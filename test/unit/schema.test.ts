import { describe, expect, it } from "vitest";

import {
  essentialsSchema,
  plannedSchema,
  projectPlannedCreateSchema,
} from "@/lib/form-zod-schema";
import { PLANNED_IMAGE_DEFAULT } from "@/lib/planned-defaults";

const validPlannedInput = {
  title: "Mechanical keyboard",
  price: "129.99",
  quantity: "2",
  priority: "HIGH",
  status: "PENDING",
  productUrl: "https://example.com/products/keyboard",
  description: "Compare switches before buying.",
  subdomain: "my-workspace",
  image: "https://example.com/images/keyboard.jpg",
};

describe("plannedSchema", () => {
  it("parses valid form values and coerces numeric strings", () => {
    const result = plannedSchema.safeParse(validPlannedInput);

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected planned input to be valid.");
    }

    expect(result.data).toEqual({
      ...validPlannedInput,
      price: 129.99,
      quantity: 2,
    });
  });

  it("applies defaults and converts blank optional fields", () => {
    const result = plannedSchema.safeParse({
      ...validPlannedInput,
      price: "",
      quantity: "",
      productUrl: "",
      description: "",
      image: "",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected blank optional form values to be valid.");
    }

    expect(result.data).toMatchObject({
      price: 0,
      quantity: 1,
      productUrl: undefined,
      description: undefined,
      image: PLANNED_IMAGE_DEFAULT,
    });
  });

  it.each([
    {
      caseName: "an empty title",
      input: { title: "" },
      field: "title",
    },
    {
      caseName: "a title longer than 500 characters",
      input: { title: "a".repeat(501) },
      field: "title",
    },
    {
      caseName: "a negative price",
      input: { price: "-0.01" },
      field: "price",
    },
    {
      caseName: "a non-numeric price",
      input: { price: "free" },
      field: "price",
    },
    {
      caseName: "a negative quantity",
      input: { quantity: "-1" },
      field: "quantity",
    },
    {
      caseName: "an unsupported priority",
      input: { priority: "NORMAL" },
      field: "priority",
    },
    {
      caseName: "an unsupported status",
      input: { status: "ARCHIVED" },
      field: "status",
    },
    {
      caseName: "an invalid product URL",
      input: { productUrl: "not-a-url" },
      field: "productUrl",
    },
    {
      caseName: "an empty subdomain",
      input: { subdomain: "" },
      field: "subdomain",
    },
    {
      caseName: "an invalid image URL",
      input: { image: "not-an-image-url" },
      field: "image",
    },
  ])("rejects $caseName", ({ input, field }) => {
    const result = plannedSchema.safeParse({
      ...validPlannedInput,
      ...input,
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error(`Expected ${field} to be invalid.`);
    }

    expect(result.error.issues[0]?.path).toEqual([field]);
  });
});

const validEssentialsInput = {
  title: "Mechanical keyboard",
  price: "129.99",
  status: "PENDING",
  quantity: "2",
  subdomain: "my-workspace",
  id: undefined,
};

describe("essentialsSchema", () => {
  it("parses valid form values and coerces numeric strings", () => {
    const result = essentialsSchema.safeParse(validEssentialsInput);
    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("Expected essentials input to be valid.");
    }

    expect(result.data).toEqual({
      ...validEssentialsInput,
      price: 129.99,
      quantity: 2,
    });
  });

  it("applies defaults and handle blank optional fields", () => {
    const result = essentialsSchema.safeParse({
      ...validEssentialsInput,
      price: "",
      quantity: "",
      id: undefined,
    });
    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("Expected blank optional form values to be valid.");
    }
    expect(result.data).toMatchObject({
      price: 0,
      status: "PENDING",
      quantity: 1,
      subdomain: "my-workspace",
      id: undefined,
    });
  });

  it.each([
    {
      caseName: "empty title",
      input: { title: "" },
      field: "title",
    },
    {
      caseName: "a title longer than 50 characters",
      input: { title: "a".repeat(51) },
      field: "title",
    },
    {
      caseName: "a negative price",
      input: { price: "-0.01" },
      field: "price",
    },
    {
      caseName: "a non-numeric price",
      input: { price: "free" },
      field: "price",
    },
    {
      caseName: "a negative quantity",
      input: { quantity: "-1" },
      field: "quantity",
    },
    {
      caseName: "a non-integer quantity",
      input: { quantity: "1.5" },
      field: "quantity",
    },

    {
      caseName: "an unsupported status",
      input: { status: "ARCHIVED" },
      field: "status",
    },
    {
      caseName: "an empty subdomain",
      input: { subdomain: "" },
      field: "subdomain",
    },
    {
      caseName: "an invalid id",
      input: { id: "not-a-cuid" },
      field: "id",
    },
  ])("rejects $caseName", ({ input, field }) => {
    const result = essentialsSchema.safeParse({
      ...validEssentialsInput,
      ...input,
    });
    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error(`Expected ${field} to be invalid.`);
    }
    expect(result.error.issues[0]?.path).toEqual([field]);
  });
});

const validProjectPlannedInput = {
  projectId: "clj123abc0000xyz",
  subdomain: "my-workspace",
  title: "Mechanical keyboard",
  price: "129.90",
  quantity: "2",
  priority: "HIGH",
  image: "https://example.com/images/keyboard.jpg",
  productUrl: "https://example.com/products/keyboard",
  description: "Compare switches before buying.",
};

describe("projectPlannedCreateSchema", () => {
  it("parses valid form values and coerces numeric strings", () => {
    const result = projectPlannedCreateSchema.safeParse(
      validProjectPlannedInput,
    );
    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("Expected project planned input to be valid.");
    }

    expect(result.data).toEqual({
      ...validProjectPlannedInput,
      price: 129.9,
      quantity: 2,
    });
  });
  it("applies defaults and converts blank optional fields", () => {
    const result = projectPlannedCreateSchema.safeParse({
      ...validProjectPlannedInput,
      price: "",
      quantity: "",
      productUrl: "",
      description: "",
      image: "",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected blank optional form values to be valid.");
    }

    expect(result.data).toMatchObject({
      price: 0,
      quantity: 1,
      productUrl: undefined,
      description: undefined,
      image: PLANNED_IMAGE_DEFAULT,
    });
  });
  it.each([
    {
      caseName: "an empty title",
      input: { title: "" },
      field: "title",
    },
    {
      caseName: "a title longer than 500 characters",
      input: { title: "a".repeat(501) },
      field: "title",
    },
    {
      caseName: "an invalid project id",
      input: { projectId: "not-a-cuid" },
      field: "projectId",
    },
    {
      caseName: "a negative price",
      input: { price: "-0.01" },
      field: "price",
    },
    {
      caseName: "a non-numeric price",
      input: { price: "free" },
      field: "price",
    },
    {
      caseName: "a negative quantity",
      input: { quantity: "-1" },
      field: "quantity",
    },
    {
      caseName: "a zero quantity",
      input: { quantity: "0" },
      field: "quantity",
    },
    {
      caseName: "a non-integer quantity",
      input: { quantity: "1.5" },
      field: "quantity",
    },
    {
      caseName: "an unsupported priority",
      input: { priority: "NORMAL" },
      field: "priority",
    },
    {
      caseName: "an invalid product URL",
      input: { productUrl: "not-a-url" },
      field: "productUrl",
    },
    {
      caseName: "an empty subdomain",
      input: { subdomain: "" },
      field: "subdomain",
    },
    {
      caseName: "an invalid image URL",
      input: { image: "not-an-image-url" },
      field: "image",
    },
  ])("rejects $caseName", ({ input, field }) => {
    const result = projectPlannedCreateSchema.safeParse({
      ...validProjectPlannedInput,
      ...input,
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error(`Expected ${field} to be invalid.`);
    }

    expect(result.error.issues[0]?.path).toEqual([field]);
  });
});
