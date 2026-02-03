import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYMENT_API_KEY = Deno.env.get("PAYMENT_API_KEY");
    if (!PAYMENT_API_KEY) {
      throw new Error("PAYMENT_API_KEY not configured");
    }

    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Missing orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check payment status
    const statusResponse = await fetch(
      `https://api.example.com/api/payment/status/${orderId}?apikey=${PAYMENT_API_KEY}`
    );

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error("Status API error:", errorText);
      throw new Error(`Status API error: ${statusResponse.status}`);
    }

    const statusData = await statusResponse.json();

    console.log("Payment status check:", { orderId, status: statusData.status });

    return new Response(
      JSON.stringify({ status: statusData.status || "pending" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error checking payment:", error);
    const message = error instanceof Error ? error.message : "Failed to check payment";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
