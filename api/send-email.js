export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, lastName, reportUrl } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ton rapport CRO est prêt</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'DM Sans',Arial,sans-serif;color:#e8e5e0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:13px;color:#6b7280;letter-spacing:0.05em;">AUDIT-ECOMMERCE.COM</p>
            </td>
          </tr>

          <!-- Card principale -->
          <tr>
            <td style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px 36px;">

              <!-- Icone check -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="width:56px;height:56px;background:rgba(130,210,170,0.12);border:1.5px solid rgba(130,210,170,0.3);border-radius:50%;display:inline-block;line-height:56px;text-align:center;font-size:24px;">✓</div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <h1 style="margin:0;font-size:24px;font-weight:400;color:#f0ede8;letter-spacing:-0.02em;">Paiement confirmé !</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:14px;color:#9ca3af;line-height:1.6;">
                      ${firstName ? `Bonjour ${firstName},<br><br>` : ''}Ton rapport CRO & Audit UX est prêt. Retrouve toutes tes recommandations personnalisées en cliquant sur le bouton ci-dessous.
                    </p>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <a href="${reportUrl || 'https://www.audit-ecommerce.com?payment=success'}" style="display:inline-block;background:linear-gradient(135deg,#82d2aa,#5fb890);color:#0a0a0a;text-decoration:none;border-radius:10px;padding:14px 32px;font-size:14px;font-weight:700;letter-spacing:-0.01em;">
                      Voir mon rapport →
                    </a>
                  </td>
                </tr>

                <!-- Séparateur -->
                <tr>
                  <td style="padding:16px 0;">
                    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0;">
                  </td>
                </tr>

                <!-- Info rapport -->
                <tr>
                  <td style="padding-bottom:8px;">
                    <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                      📄 Ton rapport inclut :<br>
                      · Scoring détaillé sur 5 axes UX/CRO<br>
                      · Recommandations personnalisées avec solutions concrètes<br>
                      · Estimation d'impact sur ton CA<br>
                      · Export PDF téléchargeable
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Réseaux sociaux -->
          <tr>
            <td style="padding:32px 0 16px;text-align:center;">
              <p style="margin:0 0 16px;font-size:12px;color:#6b7280;">Suis-moi pour plus de conseils CRO</p>
              <table cellpadding="0" cellspacing="0" style="display:inline-table;margin:0 auto;">
                <tr>
                  <td style="padding:0 8px;">
                    <a href="https://linkedin.com/in/julian-caille" style="display:inline-block;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 16px;color:#e8e5e0;text-decoration:none;font-size:12px;font-weight:600;">
                      LinkedIn
                    </a>
                  </td>
                  <td style="padding:0 8px;">
                    <a href="https://instagram.com/julian.clle" style="display:inline-block;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 16px;color:#e8e5e0;text-decoration:none;font-size:12px;font-weight:600;">
                      Instagram
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:16px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#4b5563;">
                audit-ecommerce.com · Julian Caillé<br>
                <a href="https://www.audit-ecommerce.com" style="color:#82d2aa;text-decoration:none;">www.audit-ecommerce.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Julian Caillé <noreply@audit-ecommerce.com>',
        to: [email],
        subject: 'Ton rapport CRO est prêt ✓',
        html
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
