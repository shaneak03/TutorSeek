import { PUSH_FUNCTION_URL, supabase } from "./supabase";

export async function sendPushNotification(
    userId: string, 
    title: string, 
    body: string, 
    notifType: "message" | "review",
    data?: any, 

) {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    let message: any = {
        userId,
        title,
        body,
        notifType,
        data
    }

    const response = await fetch(PUSH_FUNCTION_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to send push notification:", errorData);
    } else {
      console.log("Push notification sent successfully");
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}