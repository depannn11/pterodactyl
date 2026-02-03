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

    const { amount, panelName, whatsapp, packageId } = await req.json();

    if (!amount || !panelName || !whatsapp || !packageId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call payment API to create QRIS
    const paymentResponse = await fetch(
      `https://api.example.com/api/payment/deposit?apikey=${PAYMENT_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      }
    );

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error("Payment API error:", errorText);
      throw new Error(`Payment API error: ${paymentResponse.status}`);
    }

    const paymentData = await paymentResponse.json();

    // Store order data for later use
    const orderId = paymentData.orderId || `order_${Date.now()}`;

    console.log("Payment created:", {
      orderId,
      amount,
      amountToPay: paymentData.amountToPay,
      panelName,
      whatsapp,
      packageId,
    });

    return new Response(
      JSON.stringify({
        qrCodeUrl: paymentData.qrCodeUrl,
        amountToPay: paymentData.amountToPay,
        orderId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating payment:", error);
    const message = error instanceof Error ? error.message : "Failed to create payment";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
