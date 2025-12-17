import { z } from "zod";

export const locationSchema = z.object({
  accuracy: z.string().min(1),
  device_name: z.string().min(1).max(255),
  device_time: z.string().min(1),
  is_moving: z.boolean(),
  latitude: z.string().min(1),
  longitude: z.string().min(1),
  speed: z.string().min(1),
  timestamp: z.string().min(1),
});

export type LocationData = z.infer<typeof locationSchema>;
