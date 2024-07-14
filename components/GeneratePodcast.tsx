import { GeneratePodcastProps } from "@/types";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { useUploadFiles } from "@xixixao/uploadstuff/react";
import { api } from "@/convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "./ui/use-toast";
import { cn } from "@/lib/utils";

const useGeneratePodcast = ({
  setAudio,
  voiceType,
  voicePrompt,
  setAudioStorageId,
  image,
}: GeneratePodcastProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // so we created a new service within convex , called open Ai and then consumed that service, using action !

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  // after generating the upload url , now we want to upload the podcast in the convex, for it we take help of "uploadStuff"=> as it is associated with convex..and this uploadStuff provides a method startUpload!=>who can finally upload audio in db on calling
  // which takes an argument->filename !
  const { startUpload } = useUploadFiles(generateUploadUrl);

  const getPodcastAudio = useAction(api.voicerss.generateAudioAction);

  // already convex db mai video uploaded and ..ab voh kha h..storage_id se nikaala and uske audio_url lelo
  const getAudioUrl = useMutation(api.podcasts.getUrl);

  const generatePodcast = async () => {
    console.log(image);
    setIsGenerating(true);
    setAudio("");
    if (!voicePrompt) {
      toast({
        title: "Please provide a Voice Type",
      });
    }

    try {
      const base64Audio = await getPodcastAudio({ input: voicePrompt });

      // Convert Base64 to binary
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create a Blob from the binary data
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const fileName = `podcast-${uuidv4()}.mp3`;
      const file = new File([blob], fileName, { type: "audio/mpeg" });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;
      setAudioStorageId(storageId);

      const audioUrl = await getAudioUrl({ storageId });
      setAudio(audioUrl!);
      setIsGenerating(false);
      toast({
        title: "Podcast Generated Successfully!",
      });
    } catch (error) {
      console.log("Error generating podcast", error);
      toast({
        title: "Error generating podcast",
        description: "destructive",
      });
      setIsGenerating(false);
    }
  };
  return {
    isGenerating,
    generatePodcast,
  };
};

const GeneratePodcast = (props: GeneratePodcastProps) => {
  const { isGenerating, generatePodcast } = useGeneratePodcast(props);
  const [isAiPrompt, setIsAiPrompt] = useState(false);

  return (
    <div>
     
      <div className="flex flex-col gap-2.5 mt-8">
        <Label className="text-16 font-bold text-white-1">
          AI Prompt to generate Podcast
        </Label>
        <Textarea
          className="input-class font-light focus-visible:ring-offset-orange-1"
          placeholder="Provide text to generate audio"
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button
          type="submit"
          className="text-16 bg-orange-1 py-4 font-bold text-white-1"
          onClick={generatePodcast}
        >
          {isGenerating ? (
            <>
              Generating
              <Loader size={20} className="animate-spin ml-2" />
            </>
          ) : (
            "Generate"
          )}
        </Button>

        {props.audio && (
          <audio
            controls
            src={props.audio}
            autoPlay
            className="mt-5"
            onLoadedMetadata={(e) =>
              props.setAudioDuration(e.currentTarget.duration)
            }
          />
        )}
      </div>
    </div>
  );
};

export default GeneratePodcast;
