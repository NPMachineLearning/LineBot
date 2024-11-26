import { createHmac } from "crypto";

export const validateLineSignature = (
  channelSecret: string,
  body: string,
  xLineSignature: string | undefined
) => {
  if (!xLineSignature) return false;
  /**
   * https://developers.line.biz/en/reference/messaging-api/#signature-validation
   */
  const signature = createHmac("sha256", channelSecret)
    .update(body)
    .digest("base64");
  if (xLineSignature !== signature) {
    return false;
  }
  return true;
};

type UserProfile = {
  displayName: string;
  userId: string;
  pictureUrl: string;
  statusMessage: string;
};

export const getUserProfile = async (
  channelAccessToken: string,
  userId: string
): Promise<UserProfile> => {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${channelAccessToken}`);

  const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: headers,
  });
  const data = (await res.json()) as UserProfile;
  return data;
};

export const replyMessage = async (
  channelAccessToken: string,
  replyToken: string,
  message: string
) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${channelAccessToken}`);

  const replyBody = {
    replyToken: replyToken,
    messages: [{ type: "text", text: message }],
  };

  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(replyBody),
  });

  if (!res.ok) {
    throw new Error("Reply message fail");
  }
};
