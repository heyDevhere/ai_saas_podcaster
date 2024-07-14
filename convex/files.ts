import { v } from "convex/values";
import { mutation } from "./_generated/server";
 
export const generateUploadUrl = mutation({
  args: {
  },
  handler: async (ctx, args) => {
    return await ctx.storage.generateUploadUrl();
    // basically jo bhi tere podcast ka url , jo store hone waala h convex mai ! voh yeh method generate 
    // kerta h
  },
});