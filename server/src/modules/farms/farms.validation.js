import { z } from 'zod';

export const createFarmSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Farm name is required'),
    state: z.string().optional().default('Maharashtra'),
    district: z.string().min(2, 'District is required'),
    taluka: z.string().optional(),
    village: z.string().optional(),
    areaAcres: z.number().positive('Area must be positive').optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    soilType: z.enum([
      'ALLUVIAL', 'BLACK_COTTON', 'RED', 'LATERITE', 'SANDY', 'CLAYEY', 'LOAMY', 'SALINE', 'PEATY', 'OTHER'
    ]).optional(),
    irrigationType: z.enum([
      'DRIP', 'SPRINKLER', 'FLOOD', 'FURROW', 'CANAL', 'BOREWELL', 'RAINFED', 'OTHER'
    ]).optional(),
    waterSource: z.string().optional(),
  }),
});

export const updateFarmSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    state: z.string().optional(),
    district: z.string().optional(),
    taluka: z.string().optional(),
    village: z.string().optional(),
    areaAcres: z.number().positive().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    soilType: z.enum([
      'ALLUVIAL', 'BLACK_COTTON', 'RED', 'LATERITE', 'SANDY', 'CLAYEY', 'LOAMY', 'SALINE', 'PEATY', 'OTHER'
    ]).optional(),
    irrigationType: z.enum([
      'DRIP', 'SPRINKLER', 'FLOOD', 'FURROW', 'CANAL', 'BOREWELL', 'RAINFED', 'OTHER'
    ]).optional(),
    waterSource: z.string().optional(),
    isArchived: z.boolean().optional(),
  }),
});
