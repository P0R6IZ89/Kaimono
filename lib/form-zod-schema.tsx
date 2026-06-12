import { z } from "zod";
import { PLANNED_IMAGE_DEFAULT } from "@/lib/planned-defaults";

export const essentialsSchema = z.object({
  title: z
    .string()
    .min(1, "productNameRequired")
    .max(50, "productNameMax50"),
  price: z.coerce
    .number({ invalid_type_error: "priceNumber" })
    .nonnegative("priceNonNegative")
    .default(0),
  status: z.enum(["PENDING", "PURCHASED", "CANCELLED"], {
    message: "statusInvalid",
  }),
  quantity: z.coerce
    .number()
    .int("quantityInteger")
    .default(1),
  subdomain: z.string().min(1, "subdomainRequired"),
  id: z.string().cuid().optional(),
});

export const plannedSchema = z.object({
  title: z
    .string()
    .min(1, "productNameRequired")
    .max(500, "productNameMax500"),
  price: z.preprocess(
    (v) => (v === "" || v == null ? 0 : v),
    z.coerce.number().nonnegative(),
  ),
  quantity: z.preprocess(
    (v) => (v === "" || v == null ? 1 : v),
    z.coerce.number().nonnegative(),
  ),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
    message: "priorityInvalid",
  }),
  status: z.enum(["PENDING", "PURCHASED", "CANCELLED"], {
    message: "statusInvalid",
  }),
  productUrl: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().url().optional(),
  ),
  description: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().optional(),
  ),
  subdomain: z.string().min(1, "subdomainRequired"),
  image: z.preprocess(
    (v) => (v === "" || v == null ? PLANNED_IMAGE_DEFAULT : v),
    z.string().url(),
  ),
});

const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export const appSchema = z.object({
  name: z.string().min(1, "workspace-name-required"),
  description: z.string().max(500, "workspace-description-max").optional(),
  subdomain: z
    .string()
    .min(1, "subdomain-required")
    .max(63, "subdomain-max")
    .transform((val) => val.toLowerCase())
    .refine((val) => SUBDOMAIN_REGEX.test(val), {
      message: "subdomain-invalid-format",
    }),
});

export const plannedCommentSchema = z.object({
  content: z.string().min(1, "commentRequired"),
  author: z.string(),
  planned: z.string(),
});

export const inviteSchema = z.object({
  appId: z.string().cuid(),
  email: z.string().email("emailInvalid"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).default("MEMBER"),
});

export const statusUpdateSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["PENDING", "PURCHASED", "CANCELLED"], {
    message: "statusInvalid",
  }),
  subdomain: z
    .string()
    .min(1)
    .max(63)
    .transform((val) => val.toLowerCase())
    .refine((val) => SUBDOMAIN_REGEX.test(val), {
      message: "subdomainInvalidFormat",
    }),
});

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "projectNameRequired")
    .max(120, "projectNameMax120"),
  description: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().max(500, "descriptionMax500").optional(),
  ),
  budget: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
      .number({ invalid_type_error: "projectBudgetNumber" })
      .positive("projectBudgetPositive")
      .max(9999999999.99, "projectBudgetTooLarge")
      .optional(),
  ),
  subdomain: z.string().min(1, "subdomainRequired"),
});

export const projectLinkSchema = z.object({
  projectId: z.string().cuid(),
  plannedId: z.string().cuid(),
  subdomain: z.string().min(1, "subdomainRequired"),
});

export const projectPlannedCreateSchema = z.object({
  projectId: z.string().cuid(),
  subdomain: z.string().min(1, "subdomainRequired"),
  title: z
    .string()
    .min(1, "productNameRequired")
    .max(500, "productNameMax500"),
  price: z.preprocess(
    (v) => (v === "" || v == null ? 0 : v),
    z.coerce.number().nonnegative(),
  ),
  quantity: z.preprocess(
    (v) => (v === "" || v == null ? 1 : v),
    z.coerce.number().int().nonnegative(),
  ),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
    message: "priorityInvalid",
  }),
  image: z.preprocess(
    (v) => (v === "" || v == null ? PLANNED_IMAGE_DEFAULT : v),
    z.string().url(),
  ),
  productUrl: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().url().optional(),
  ),
  description: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().optional(),
  ),
});
