import { openai } from "@ai-sdk/openai";

export const MODEL = openai("gpt-4.1");

// If you want to use a Fireworks model, uncomment the following code and set the FIREWORKS_API_KEY in Vercel
// NOTE: Use middleware when the reasoning tag is different than think.
// export const MODEL = wrapLanguageModel({
//   model: fireworks("fireworks/deepseek-r1-0528"),
//   middleware: extractReasoningMiddleware({ tagName: "think" }),
// });

function getDateAndTime(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  return `The day today is ${dateStr} and the time right now is ${timeStr}.`;
}

export const DATE_AND_TIME = getDateAndTime();

export const AI_NAME = "LeaseLens";
export const OWNER_NAME = "Isaiah Singleton";

export const WELCOME_MESSAGE = `Hi, I'm ${AI_NAME}. I help renters find, compare, evaluate, and organize apartment options with clear tradeoffs, budget guidance, and scam-aware recommendations.`;

export const CLEAR_CHAT_TEXT = "New Search";

export const MODERATION_DENIAL_MESSAGE_SEXUAL =
  "I can't help with explicit sexual content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_SEXUAL_MINORS =
  "I can't help with sexual content involving minors. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_HARASSMENT =
  "I can't help with harassing or abusive content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_HARASSMENT_THREATENING =
  "I can't help with threatening or abusive content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_HATE =
  "I can't help with hateful content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_HATE_THREATENING =
  "I can't help with threatening hateful content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_ILLICIT =
  "I can't help with illegal activity. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_ILLICIT_VIOLENT =
  "I can't help with violent illegal activity. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM =
  "I can't help with self-harm content. If you're struggling, please contact a qualified mental health professional or local crisis resource.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INTENT =
  "I can't help with self-harm intent. If you're in immediate danger or may act on these thoughts, contact emergency services or a local crisis line right now.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INSTRUCTIONS =
  "I can't provide self-harm instructions. If you're struggling, please contact a qualified mental health professional or local crisis resource.";
export const MODERATION_DENIAL_MESSAGE_VIOLENCE =
  "I can't help with violent content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_VIOLENCE_GRAPHIC =
  "I can't help with graphic violent content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_DEFAULT =
  "I can't help with that request. Please ask something else.";

export const PINECONE_TOP_K = 40;
export const PINECONE_INDEX_NAME = "my-ai";
