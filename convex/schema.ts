import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  podcasts: defineTable({
    // https://docs.convex.dev/api/modules/values#v

    // ager yeh storage null ho bhi jata h therefore we write optional
    // v.optional(v.id()) specifies that a field is optional and, if present, must be a id. and we name the id
    // as _storage
    audioStorageId: v.optional(v.id("_storage")),
    // user who has created the podcast
    user: v.id('users'),

    // we dont necessary have to make relation with the user and the pocast...and i am storing author info..which is indeed the user info only !
    author: v.string(),
    podcastTitle: v.string(),
    podcastDescription: v.string(),
    audioUrl: v.optional(v.string()),

    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    authorId: v.string(),
    authorImageUrl: v.string(),

    // what the ai , will be saying
    voicePrompt: v.string(),

    // imagePromp, this will be used to generate ai thumbnail
    imagePrompt: v.string(),

    // kis awaaj mai ai podcast generate kerega
    // voiceType: v.string(),

    audioDuration: v.number(),

    views: v.number(),

    // this searchIndex defines , if you want to search our podcast table with the specific field ! , thatway convex will
    // automatically dispplay the searchterm for us,so that we can easily query it
  })
    .searchIndex("search_author", { searchField: "author" })
    .searchIndex("search_title", { searchField: "podcastTitle" })
    .searchIndex("search_body", { searchField: "podcastDescription" }),

  users: defineTable({
    email: v.string(),
    imageUrl: v.string(),
    // clerk id attached to this specific user
    clerkId: v.string(),
    name: v.string(),
  }),
});
