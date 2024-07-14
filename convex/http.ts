// in this file we define a web hook form , we typically use it to recive data from external application !(clerk)

// it allows our app to cummunicate with clerk , then call this function !

// basically first the clerk user is created ==> then cleark sends info to us , about the user , then we call
// our own users.createUser function , to store that particuler user created by cleak, in our database !

// with this http , we can interact with the data present in the convex db, by internalmutations and what not !

// raw code to get data from the clerk

// ===== reference links =====
// https://www.convex.dev/templates (open the link and choose for clerk than you will get the github link mentioned below)
// https://github.dev/webdevcody/thumbnail-critique/blob/6637671d72513cfe13d00cb7a2990b23801eb327/convex/schema.ts

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validateRequest(request);
  if (!event) {
    return new Response("Error occured", {
      status: 400,
    });
  }
  switch (event.type) {
    case "user.created":
      await ctx.runMutation(
        internal.users.createUser,{
        // dont question !! , this is the way clerk gives it to us !
          clerkId: event.data.id,
          email: event.data.email_addresses[0].email_address,
          imageUrl: event.data.image_url,
        //   exmplanation ! , to tell ts , that type is well definaed dont take tension !
          name: event.data.first_name!,
        }
      );
      case "user.updated":
        await ctx.runMutation(internal.users.updateUser, {
          clerkId: event.data.id,
          imageUrl: event.data.image_url,
          email: event.data.email_addresses[0].email_address,
        });
        break;
      case "user.deleted":
        await ctx.runMutation(internal.users.deleteUser, {
          clerkId: event.data.id as string,
        });
        break;
    }
    return new Response(null, {
      status: 200,
    });
  });
  
  const http = httpRouter();
  
  http.route({
    path: "/clerk",
    method: "POST",
    handler: handleClerkWebhook,
  });
  
  const validateRequest = async (
    req: Request
  ): Promise<WebhookEvent | undefined> => {
    // key note : add the webhook secret variable to the environment variables field in convex dashboard setting

    // now i want a web_hook secret, which checks that clerk is giving data ya koi aur de rha h,,,therefore clerk want the destination url...to whom to give the data
    // we give clerk , the final deployed url of the application !

//***
    // we will put the  actual deployed url afterwords ...now kaam chalaoo with localhost ! **//
    
    
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
    if (!webhookSecret) {
      throw new Error("CLERK_WEBHOOK_SECRET is not defined");
    }
    const payloadString = await req.text();
    const headerPayload = req.headers;
    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id")!,
      "svix-timestamp": headerPayload.get("svix-timestamp")!,
      "svix-signature": headerPayload.get("svix-signature")!,
    };
    const wh = new Webhook(webhookSecret);
    const event = wh.verify(payloadString, svixHeaders);
    return event as unknown as WebhookEvent;
  };
  
  export default http;