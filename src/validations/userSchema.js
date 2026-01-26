import { z } from "zod";

export const userSchema = z.object({
  fullname: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  mobileNumber: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  state: z.string().min(1, "Province is required"),
  constituency: z.string().min(1, "Constituency is required"),
  ward: z.string().min(1, "Ward is required"),
  facility: z.string().min(1, "Facility is required"),
});
