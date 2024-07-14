import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import Fuse from "fuse.js";
import { IFuseOptions } from "fuse.js"; 
import { PodcastProps } from "@/types";

export const getUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const createPodcast = mutation({
  args: {
    audioStorageId: v.id("_storage"),
    podcastTitle: v.string(),
    podcastDescription: v.string(),
    audioUrl: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.id("_storage"),
    voicePrompt: v.string(),
    imagePrompt: v.string(),
    views: v.number(),
    audioDuration: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("User not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .collect();

    if (user.length === 0) {
      throw new ConvexError("User not found");
    }

    const podcast=await ctx.db.insert("podcasts", {
      ...args,
      user: user[0]._id,
      author: user[0].name,
      authorId: user[0].clerkId,
      authorImageUrl: user[0].imageUrl,
    })
    return podcast;
  },
});


export const getTrendingPodcasts = query({
  handler: async (ctx) => {
    const podcast = await ctx.db.query("podcasts").collect();
      return podcast;
  },
});


export const getPodcastById = query({
  args: {
    // we are looking for the id , which is in "podcasts" table
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.podcastId);
  },
});


// fuzzy searching not working !!!

// export const getPodcastBySimilarity = query({
//   args: {
//     podcastId: v.id("podcasts"),
//   },
//   handler: async (ctx, args) => {
//     const podcast = await ctx.db.get(args.podcastId);
//     if (!podcast) {
//       return [];
//     }

//     const allpodcast: PodcastProps[] = (await ctx.db.query("podcasts").collect())
//     .filter(podcast => podcast.audioStorageId !== undefined) as PodcastProps[];    

//     // // Ensuring the list does not contain the original podcast
//     const filteredPodcasts = allpodcast;
//     if (filteredPodcasts.length === 0) {
//       return [];
//     }

//        const fuseOptions: IFuseOptions<PodcastProps> = {
//       keys: [ 'podcastDescription'],
//       threshold: 0.3, // Adjust threshold for similarity matching
//     };

//     const fuse = new Fuse(filteredPodcasts, fuseOptions);
//     const searchTerm = `${podcast.podcastDescription}`;
//     const results = fuse.search(searchTerm);

//     // Return the items from the search results
//     return results.map(result => result.item);
//   },
// });


export const getPodcastBySimilarity = query({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);

    return await ctx.db
      .query("podcasts")
      .filter((q) =>
        q.and(
          // q.eq(q.field("voiceType"), podcast?.voiceType),
          q.eq(q.field("authorId"), podcast?.authorId),
          // q.eq(q.field("_id"), args.podcastId)
        )
      )
      .collect();
  },

});


export const getAllPodcasts = query({
  handler: async (ctx) => {
    return await ctx.db.query("podcasts").order("desc").collect();
  },
});

export const getPodcastBySearch = query({
  args: {
    search: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.search === "") {
      return await ctx.db.query("podcasts").order("desc").collect();
    }

    const authorSearch = await ctx.db
      .query("podcasts")
      .withSearchIndex("search_author", (q) => q.search("author", args.search))
      .take(10);

    if (authorSearch.length > 0) {
      return authorSearch;
    }

    const titleSearch = await ctx.db
      .query("podcasts")
      .withSearchIndex("search_title", (q) =>
        q.search("podcastTitle", args.search)
      )
      .take(10);

    if (titleSearch.length > 0) {
      return titleSearch;
    }

    return await ctx.db
      .query("podcasts")
      .withSearchIndex("search_body", (q) =>
        q.search("podcastDescription" || "podcastTitle", args.search)
      )
      .take(10);
  },
});

// this mutation will update the views of the podcast.
export const updatePodcastViews = mutation({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);

    if (!podcast) {
      throw new ConvexError("Podcast not found");
    }

    return await ctx.db.patch(args.podcastId, {
      views: podcast.views + 1,
    });
  },
});

// this mutation will delete the podcast.
export const deletePodcast = mutation({
  args: {
    podcastId: v.id("podcasts"),
    imageStorageId: v.id("_storage"),
    audioStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);

    if (!podcast) {
      throw new ConvexError("Podcast not found");
    }

    await ctx.storage.delete(args.imageStorageId);
    await ctx.storage.delete(args.audioStorageId);
    return await ctx.db.delete(args.podcastId);
  },
});

export const getPodcastByAuthorId = query({
  args: {
    authorId: v.string(),
  },
  handler: async (ctx, args) => {
    const podcasts = await ctx.db
      .query("podcasts")
      .filter((q) => q.eq(q.field("authorId"), args.authorId))
      .collect();

    const totalListeners = podcasts.reduce(
      (sum, podcast) => sum + podcast.views,
      0
    );

    return { podcasts, listeners: totalListeners };
  },
});




 