export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  const submittedCode = String(req.body?.code || "").trim();

  let accessCodes = {};

  try {
    accessCodes = JSON.parse(process.env.OTOS_ACCESS_CODES || "{}");
  } catch (error) {
    console.error("OTOS_ACCESS_CODES is not valid JSON");
    return res.status(500).json({
      ok: false,
      error: "Server configuration error"
    });
  }

  const inviteeName = accessCodes[submittedCode];

  if (!inviteeName) {
    console.log("OTOS login failed");
    return res.status(401).json({
      ok: false,
      error: "Access code not recognised."
    });
  }

  const sessionToken = process.env.OTOS_SESSION_TOKEN;

  if (!sessionToken) {
    return res.status(500).json({
      ok: false,
      error: "Missing session configuration"
    });
  }

  const safeInvitee = encodeURIComponent(inviteeName);

  res.setHeader("Set-Cookie", [
    `otos_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
    `otos_invitee=${safeInvitee}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
  ]);

  console.log(`OTOS login success: ${inviteeName}`);

  return res.status(200).json({
    ok: true
  });
}
