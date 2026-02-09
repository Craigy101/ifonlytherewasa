import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") || "";
const SITE_URL = Deno.env.get("NEXT_PUBLIC_SITE_URL") || "https://ifonlytherewasa.com";

interface MatchEmail {
  to: string;
  username: string;
  indexName: string;
  posts: Array<{ title: string; slug: string }>;
}

function buildHtml(data: MatchEmail): string {
  const postList = data.posts
    .map(
      (p) =>
        `<tr><td style="padding:12px 16px;border-bottom:1px solid #2A2A2A">
          <a href="${SITE_URL}/post/${p.slug}" style="color:#FAFAFA;text-decoration:none;font-weight:600">${p.title}</a>
        </td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #2A2A2A">
      <h1 style="color:#FAFAFA;font-size:20px;margin:0">IOTWA</h1>
      <p style="color:#666666;font-size:12px;margin:4px 0 0">If Only There Was A</p>
    </div>
    <div style="padding:24px 0">
      <p style="color:#FAFAFA;font-size:16px;margin:0 0 8px">Hi ${data.username},</p>
      <p style="color:#A0A0A0;font-size:14px;margin:0 0 24px">
        New posts match your search index <strong style="color:#FAFAFA">"${data.indexName}"</strong>:
      </p>
      <table style="width:100%;border-collapse:collapse;background-color:#141414;border-radius:8px;border:1px solid #2A2A2A">
        ${postList}
      </table>
    </div>
    <div style="text-align:center;padding-top:24px;border-top:1px solid #2A2A2A">
      <a href="${SITE_URL}/profile/developer" style="display:inline-block;padding:10px 24px;background-color:#FAFAFA;color:#0A0A0A;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px">View Dashboard</a>
    </div>
    <p style="color:#666666;font-size:11px;text-align:center;margin-top:24px">
      You're receiving this because you have an active search index on IOTWA.
    </p>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  try {
    const { matches } = await req.json() as { matches: MatchEmail[] };
    const results = [];

    for (const match of matches) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "IOTWA", email: "results@ifonlytherewasa.com" },
          to: [{ email: match.to }],
          subject: `New matches for "${match.indexName}"`,
          htmlContent: buildHtml(match),
        }),
      });
      results.push({ email: match.to, status: res.status });
    }

    return new Response(JSON.stringify({ sent: results.length, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
