export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { url, urlHome, homeContent, productContent, niche } = req.body;
    const finalUrl = url || urlHome || 'URL non fournie';

    const pageCtx = homeContent
      ? `\nCONTENU HOMEPAGE (extrait):\n${homeContent.slice(0, 1500)}`
      : '';

    const prompt = `Tu es un consultant CRO senior e-commerce. Analyse cette boutique et retourne UNIQUEMENT un JSON valide (pas de markdown, pas de texte autour).

URL: ${finalUrl}
Niche: ${niche}
${pageCtx}

JSON à retourner (complète chaque champ, scores sur 100):
{"resume_executif":{"score_global":0,"synthese":"","plus_grande_opportunite":""},"scoring":{"clarte_offre":0,"copywriting":0,"mobile_ux":0,"confiance":0,"persuasion":0},"diagnostic":{"forces":["",""],"faiblesses":["",""]},"recommandations":[{"titre":"","probleme":"","solution":"","impact":"eleve","effort":"faible","section":""},{"titre":"","probleme":"","solution":"","impact":"eleve","effort":"moyen","section":""},{"titre":"","probleme":"","solution":"","impact":"moyen","effort":"faible","section":""},{"titre":"","probleme":"","solution":"","impact":"moyen","effort":"moyen","section":""},{"titre":"","probleme":"","solution":"","impact":"moyen","effort":"eleve","section":""},{"titre":"","probleme":"","solution":"","impact":"eleve","effort":"moyen","section":""},{"titre":"","probleme":"","solution":"","impact":"eleve","effort":"faible","section":""},{"titre":"","probleme":"","solution":"","impact":"moyen","effort":"faible","section":""}],"quick_wins":[{"action":"","impact":""},{"action":"","impact":""},{"action":"","impact":""}]}

Règles: sois spécifique à ${finalUrl}, recommandations concrètes et actionnables, analyse réelle basée sur la niche ${niche}. UNIQUEMENT le JSON, rien d'autre.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(500).json({ error: 'Erreur API Claude', details: error });
    }

    const data = await response.json();
    const rawText = data.content[0].text;
    const clean = rawText.replace(/```json|```/g, '').trim();
    const analyse = JSON.parse(clean);

    return res.status(200).json({ success: true, analyse });

  } catch (err) {
    console.error('Function error:', err);
    return res.status(500).json({ error: 'Erreur serveur', message: err.message });
  }
}
