import { z } from "zod";

const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export const contactSchema = z.object({
  subdomain: z
    .string()
    .trim()
    .min(1, "subdomainRequired")
    .max(63)
    .regex(SUBDOMAIN_REGEX, "subdomainInvalidFormat"),
  fullName: z
    .string()
    .trim()
    .min(2, "contactNameMin2")
    .max(100, "contactNameMax100"),
  email: z.string().trim().email("emailInvalid").max(254, "contactEmailMax254"),
  title: z
    .string()
    .trim()
    .min(3, "contactSubjectMin3")
    .max(160, "contactSubjectMax160")
    .regex(/^[^\r\n]+$/, "contactSubjectSingleLine"),
  description: z
    .string()
    .trim()
    .min(10, "contactMessageMin10")
    .max(5000, "contactMessageMax5000"),
});
