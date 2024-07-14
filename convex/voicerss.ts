// action are third party services ..to do some things
// we will be using openAi api to do something !

// handler hota h
// action can , but does not have to return a value
// action take arguments !
// and in the handler , we use the arguments to call the openAi api

// actions also have excess to contest , which allows us to read the data from the database!..like it uses runQuery()
// we can also use RunMutation in actions

// import { action } from "./_generated/server";
// import { v } from "convex/values";
// import openAI from "openai";
// import { SpeechCreateParams } from "openai/resources/audio/speech.mjs";

// const openai=new openAI({
//     apiKey: process.env.OPENAI_API_KEY,
// })

// // so we have to make a instance of the open ai , and in order to make we require a apiKey !

// export const generateAudioAction =  action({
//   // voiceType   voice
//   args: { input: v.string(), voice: v.string() },
//    handler: async (_, {voice,input}) => {
//     const mp3 = await openai.audio.speech.create({
//         model: "tts-1",
//         // this speechCreateParam is used to ensure that the voicetype is the one which openAi wants and has defined !
//         voice:voice as SpeechCreateParams['voice'],
//         input,
//       });
//       const buffer = Buffer.from(await mp3.arrayBuffer());
//       return buffer;
//   },
// });

// convex/actions/voicerss.ts

// convex/actions/voicerss.ts






import { action } from "./_generated/server";
import fetch from "node-fetch";
import { v } from "convex/values";

export const generateAudioAction = action({
  args: { input: v.string() },
  handler: async (_, { input }) => {


    const apiKey = "d9875268b74d4de68c0d76795877b3d1"; // Replace with your actual API key

    const url = `https://api.voicerss.org/?key=${apiKey}&hl=en-us&src=${encodeURIComponent(input)}`;


    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const buffer: ArrayBuffer = await response.arrayBuffer(); // Fetch the response as ArrayBuffer
      const bytes: Uint8Array = new Uint8Array(buffer); // Convert ArrayBuffer to Uint8Array

      // Convert Uint8Array to binary string
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      // Convert binary string to Base64
      const base64String: string = btoa(binary);
      // console.log(base64String);
      return base64String;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to generate audio: `);
    }
  },
});


export const generateThumbnailAction = action({
  args: { query: v.string() },
  handler: async (_, { query }) => {
    const apiKey = 'NV0LokM8FpZUvzPsrtJHdfJkm7mKanmtMA7UHAUE1wN48lsncYiJKsYF';

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: apiKey,
        },
      });
      

      const data = await response.json();
      const imageUrl = data.photos[0]?.src?.medium;

      if (!imageUrl) {
        throw new Error('No images found');
      }

      // const imageResponse=await fetch(url);
      // const buffer=await imageResponse.arrayBuffer();
      return imageUrl;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch image');
    }
  },
});


interface LabelAnnotation {
  mid: string;
  description: string;
  score: number;
  topicality: number;
}


export const analyzeImageAction = action({
  args: { imageUrl: v.string() },
  handler: async (_, { imageUrl }) => {
    const apiKey = 'AIzaSyDm8P0hxWAkh4I7Tb4S-tsBClduCPxqYBA';
    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    try {
      // Fetch the image and convert it to base64
      const response1 = await fetch(imageUrl);
      const buffer: ArrayBuffer = await response1.arrayBuffer(); // Fetch the response as ArrayBuffer
      const bytes: Uint8Array = new Uint8Array(buffer); // Convert ArrayBuffer to Uint8Array

      // Convert Uint8Array to binary string
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      // Convert binary string to Base64
      const imageBase64: string = btoa(binary);
      console.log(imageBase64);
      const requestBody = {
        requests: [
          {
            image: {
              content: imageBase64,
            },
            features: [
              {
                type: 'LABEL_DETECTION',
              },
            ],
          },
        ],
      };

      const response = await fetch(visionApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      const labels = result.responses[0].labelAnnotations;
      
      if (!labels || labels.length === 0) {
        throw new Error('No labels found');
      }

      // Generate a descriptive paragraph
      const descriptions = labels.map((label:LabelAnnotation) => label.description);
      const description = generateParagraph(descriptions);
      console.log(description);
      return description;

    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error('Failed to analyze image');
    }
  },
});

async function fetchAndConvertImage(imageUrl: string): Promise<Buffer> {
  try {
    const imageResponse = await fetch(imageUrl);
    // if (!imageResponse.ok) {
    //   throw new Error(`Failed to fetch image, status ${imageResponse.status}`);
    // }

    return await imageResponse.buffer(); // Convert response to buffer
  } catch (error) {
    console.error('Error fetching image:', error);
    throw new Error('Failed to fetch image');
  }
}

function generateParagraph(descriptions:string[]) {
  // Custom logic to create a paragraph from descriptions
  const intro = "This Podcast majorly includes information about ";
  const mainContent = descriptions.join(', ') + '.';
  // const conclusion = descriptions.length > 5 ? " There are also other elements in the image." : "";
  return intro + mainContent;
}
