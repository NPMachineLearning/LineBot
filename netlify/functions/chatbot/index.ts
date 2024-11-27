import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import {
  getUserProfile,
  replyMessage,
  validateLineSignature,
} from "../../../utils/line";

// In Line official account -> Messaging API console
const channelSecret = process.env.LineChannelSecret || "";

// In Line developer console -> Messaging API
const channelAccessToken = process.env.LineChannelAccessToken || "";

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  try {
    const bodyStr = event.body;
    if (!bodyStr) {
      throw new Error("No message received");
    }

    // parse event's body to json
    const body = JSON.parse(bodyStr);

    // check if message from line or not
    if (
      !validateLineSignature(
        channelSecret,
        bodyStr,
        event.headers["x-line-signature"]
      )
    ) {
      throw new Error("Message not from line");
    }

    // if there is at least one event
    if (body.events.length > 0) {
      // get line message event
      const msgEvent = body.events[0];
      // console.log(msgEvent);

      // get user profile
      const userId = msgEvent["source"]["userId"];
      const text = msgEvent["message"]["text"];
      const userProfile = await getUserProfile(channelAccessToken, userId);
      // console.log(userProfile);

      // if message is talking to the bot
      if (text.startsWith("/bot")) {
        const message = text.substring("/bot".length).trim();
        // reply message
        await replyMessage(
          channelAccessToken,
          msgEvent["replyToken"],
          `${userProfile.displayName} \n\nHow can I help?`
        );
      }
    }

    return {
      statusCode: 200,
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: e instanceof Error ? e.message : "Something went wrong!",
      }),
    };
  }
};
