import { generateObject } from "ai";
import { z } from "zod";
import { MODEL } from "@/config";

const chatTitleSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(40)
    .transform((value) => value.trim()),
});

export async function POST(req: Request) {
  try {
    const { message }: { message?: string } = await req.json();

    if (!message || !message.trim()) {
      return Response.json(
        { error: "A message is required." },
        { status: 400 }
      );
    }

    const result = await generateObject({
      model: MODEL,
      schema: chatTitleSchema,
      system:
        "You create very short titles for apartment-hunting chats. Return a natural title of one to five words. Do not use quotes. Do not include punctuation unless absolutely necessary.",
      prompt: `User inquiry:\n${message.trim()}\n\nReturn a short title that would look good in a sidebar.`,
    });

    return Response.json({
      title: result.object.title,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate title.",
      },
      { status: 500 }
    );
  }
}
