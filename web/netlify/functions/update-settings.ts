import { createPublicClient, http } from "viem";
import { createClient } from "@supabase/supabase-js";
import { arbitrumGoerli } from "viem/chains";

const publicClient = createPublicClient({
  chain: arbitrumGoerli,
  transport: http(),
});

const SUPABASE_KEY = process.env.SUPABASE_CLIENT_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

export const uploadSettingsToSupabase = async function (event: any, context: any) {
  try {
    const { message, address, signature } = JSON.parse(event.body);
    const email = message.split("Email:").pop().split(",Nonce:")[0].trim();
    const nonce = message.split("Nonce:").pop().trim();
    const isValid = await publicClient.verifyMessage({ address, message: message, signature });
    // If the recovered address does not match the provided address, return an error
    if (!isValid) {
      throw new Error("Signature verification failed");
    }
    // Allowed columns to update
    const allowedColumns = ["discord", "telegram", "twitter", "matrix", "push", "email"];
    // If the message is empty, delete the user record
    if (email === "") {
      const { data, error } = await supabase.from("users").delete().match({ address: address });
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify({ message: "Record deleted successfully." }) };
    }
    // Parse the signed message     console.log("2", email);
    const parsedMessage = JSON.parse(JSON.stringify(email));
    // Prepare the record data based on the allowed columns
    const recordData: { [key: string]: any } = {};
    for (const key in parsedMessage) {
      if (allowedColumns.includes(key)) {
        recordData[key] = parsedMessage[key];
      }
    }
    // Assuming you have a 'users' table with 'address' and allowedColumns fields
    const { data, error } = await supabase
      .from("user-settings")
      .upsert({ address, email: email })
      .match({ address: address });
    if (error) throw error;
    return { statusCode: 200, body: JSON.stringify({ message: "Record updated successfully." }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: `Error: ` }) };
  }
};
