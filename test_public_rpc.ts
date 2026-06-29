import { loadEnvConfig } from "@next/env";
import { createPublicClient } from "./lib/supabase/public";

loadEnvConfig(process.cwd());

async function main() {
  const publicClient = createPublicClient();
  const hotelId = "80210a67-ce76-4465-9400-f583d6c0a7bf"; // Noida Business Suites ID

  console.log(`Calling get_hotel_reviews via PUBLIC client for hotel ${hotelId}...`);
  const { data: reviews, error } = await publicClient
    .rpc("get_hotel_reviews", { p_hotel_id: hotelId });

  if (error) {
    console.error("Public RPC Error:", error);
  } else {
    console.log("Public RPC returned reviews count:", reviews?.length);
    console.log("Reviews:", JSON.stringify(reviews, null, 2));
  }
}

main().catch(console.error);
