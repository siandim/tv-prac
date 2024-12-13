import { z } from 'zod';

// Schema for POST request (creation)
const createSchema = z.object({
  name: z.string(),
  source: z.string(),
  panel: z.number().int().positive(),  
  tvId: z.number().int().positive(), 
});

// Schema for PUT and PATCH requests (updates)
const updateSchema = z.object({
  id: z.number().int().positive(), 
  name: z.string(),
  source: z.string(),
  panel: z.number().int().positive(),  
  tvId: z.number().int().positive(),  
  insideIndex: z.number().int().optional(),  // Make insideIndex optional for updates
});

const partialUpdateSchema = updateSchema.partial();  // Allows partial updates

export { createSchema, updateSchema, partialUpdateSchema };
