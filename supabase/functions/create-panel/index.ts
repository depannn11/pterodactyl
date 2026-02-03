import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PTERODACTYL_DOMAIN = "https://depstore11-private.shanydev.web.id";
const LOCATION_ID = 1;
const EGG_ID = 15;

function generatePassword(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateUsername(panelName: string): string {
  const sanitized = panelName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const suffix = Math.floor(Math.random() * 1000);
  return `${sanitized.substring(0, 8)}${suffix}`;
}

async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  message: string
) {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Telegram error:", error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PTLA = Deno.env.get("PTERODACTYL_PTLA");
    const PLTC = Deno.env.get("PTERODACTYL_PLTC");
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");

    if (!PTLA || !PLTC) {
      throw new Error("Pterodactyl API keys not configured");
    }

    const { panelName, password, whatsapp, ram, disk, cpu } = await req.json();

    if (!panelName || !whatsapp || !ram || !disk || !cpu) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const finalPassword = password || generatePassword();
    const username = generateUsername(panelName);
    const email = `${username}@depstore11.local`;

    // Step 1: Create user
    console.log("Creating Pterodactyl user...");
    const userResponse = await fetch(`${PTERODACTYL_DOMAIN}/api/application/users`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PTLA}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email,
        username,
        first_name: panelName,
        last_name: "User",
        password: finalPassword,
      }),
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("User creation error:", errorText);
      throw new Error(`Failed to create user: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    const userId = userData.attributes.id;
    console.log("User created:", userId);

    // Step 2: Create server
    console.log("Creating Pterodactyl server...");
    const serverResponse = await fetch(`${PTERODACTYL_DOMAIN}/api/application/servers`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PTLA}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name: panelName,
        user: userId,
        egg: EGG_ID,
        docker_image: "ghcr.io/pterodactyl/yolks:java_17",
        startup: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}",
        environment: {
          SERVER_JARFILE: "server.jar",
          BUILD_NUMBER: "latest",
        },
        limits: {
          memory: ram * 1024,
          swap: 0,
          disk: disk * 1024,
          io: 500,
          cpu,
        },
        feature_limits: {
          databases: 1,
          backups: 1,
          allocations: 1,
        },
        allocation: {
          default: 1,
        },
        deploy: {
          locations: [LOCATION_ID],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });

    if (!serverResponse.ok) {
      const errorText = await serverResponse.text();
      console.error("Server creation error:", errorText);
      throw new Error(`Failed to create server: ${serverResponse.status}`);
    }

    const serverData = await serverResponse.json();
    const serverId = serverData.attributes.identifier;
    console.log("Server created:", serverId);

    // Send Telegram notification
    if (TELEGRAM_BOT_TOKEN) {
      const message = `🆕 <b>Pesanan Baru!</b>

📦 <b>Detail Panel:</b>
• Nama: ${panelName}
• Username: ${username}
• RAM: ${ram}GB
• Disk: ${disk}GB
• CPU: ${cpu}%

📱 <b>WhatsApp:</b> ${whatsapp}

🔗 Server ID: ${serverId}`;

      await sendTelegramNotification(TELEGRAM_BOT_TOKEN, "8412273544", message);
    }

    return new Response(
      JSON.stringify({
        domain: PTERODACTYL_DOMAIN,
        username,
        password: finalPassword,
        serverId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating panel:", error);
    const message = error instanceof Error ? error.message : "Failed to create panel";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
