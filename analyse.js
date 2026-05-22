export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, niche, visiteurs, cvr_actuel, panier_moyen, cvr_cible } = req.body;

    const ca_actuel = visiteurs && cvr_actuel && panier_moyen
      ? Math.round(visiteurs * (cvr_actuel / 100) * panier_moyen)
      : null;

    const ca_potentiel = visiteurs && cvr_cible && panier_moyen
      ? Math.round(visiteurs * (cvr_cible / 100) * panier_moyen)
      : null;

    const gain_mensuel = ca_actuel && ca_potentiel ? ca_potentiel - ca_actuel : null;

    const metriques_block = visiteurs ? `
- Visiteurs / mois : ${parseInt(visiteurs).toLocaleString('fr-FR')}
- Taux de conversion actuel : ${cvr_actuel}%
- Panier moyen : ${panier_moyen}€
- CA actuel / mois : ${ca_actuel.toLocaleString('fr-FR')}€
- Taux de conversion cible : ${cvr_cible}%
- CA potentiel / mois : ${ca_potentiel.toLocaleString('fr-FR')}€
- Gain mensuel potentiel : ${gain_mensuel.toLocaleString('fr-FR')}€
` : `Aucune métrique business fournie. Baser l'analyse uniquement sur les éléments UX/CRO observables.`;

    const prompt = `Tu es Julian Caillé, consultant senior UX/UI & CRO spécialisé en e-commerce depuis plus de 5 ans.

Tu réalises des audits CRO premium comparables à ceux produits par des agences CRO haut de gamme.

Tu combines :
- UX e-commerce,
- psychologie cognitive,
- persuasion,
- copywriting direct response,
- optimisation du taux de conversion,
- analyse comportementale,
- architecture de confiance,
- mobile-first UX,
- heuristiques UX,
- stratégie de revenus.

Ton rôle :
Analyser une boutique e-commerce à partir de son URL et produire un audit CRO extrêmement pertinent, crédible et actionnable.

Tu ne fais JAMAIS de recommandations génériques.
Tu évites absolument :
- "améliorer l'UX"
- "ajouter des avis"
- "optimiser le parcours"
- "rassurer le client"

Chaque insight doit être :
- spécifique,
- concret,
- relié à un problème observable,
- relié à un mécanisme psychologique,
- relié à un impact business.

Tu raisonnes comme un consultant CRO senior facturant plusieurs milliers d'euros par audit.

LANGUE : Tu réponds UNIQUEMENT en français.

# CONTEXTE

URL : ${url}
Niche : ${niche}

# DONNÉES BUSINESS

${metriques_block}

# MÉTHODOLOGIE

Avant de répondre :
1. Analyse mentalement le comportement d'un visiteur froid sur ${url}.
2. Identifie les moments de confusion.
3. Détecte les frictions cognitives.
4. Analyse la vitesse de compréhension de l'offre.
5. Analyse la hiérarchie visuelle.
6. Analyse la qualité de persuasion.
7. Analyse les signaux de confiance.
8. Analyse les points de fuite potentiels.
9. Priorise les problèmes selon leur impact probable sur une boutique de niche ${niche}.
10. Déduis les optimisations à plus fort ROI.

# RÈGLES IMPORTANTES

- Ne jamais inventer de données business.
- Ne jamais donner de conseils vagues.
- Toujours être spécifique à la boutique ${url} dans la niche ${niche}.
- Chaque champ "analyse" doit contenir minimum 3 phrases détaillées.
- Chaque "problemes" doit contenir minimum 2 problèmes concrets.
- Chaque "recommandations" doit contenir minimum 2 recommandations actionnables.
- Les scores sont sur 100.

# FORMAT DE SORTIE

Réponds UNIQUEMENT en JSON valide, sans balises markdown, sans texte autour.

{
  "mode": "freemium_heuristic_audit",
  "resume_executif": {
    "niveau_maturite_cro": "",
    "score_global": 0,
    "synthese": "",
    "plus_grande_opportunite": ""
  },
  "scoring": {
    "clarte_offre": 0,
    "copywriting": 0,
    "mobile_ux": 0,
    "confiance": 0,
    "persuasion": 0,
    "desirabilite": 0
  },
  "diagnostic": {
    "forces": [],
    "faiblesses": [],
    "frictions_critiques": [
      {
        "probleme": "",
        "impact_psychologique": "",
        "impact_business": "",
        "priorite": "critique|haute|moyenne"
      }
    ]
  },
  "analyse_detaillee": {
    "proposition_valeur": { "analyse": "", "problemes": [], "recommandations": [] },
    "above_the_fold": { "analyse": "", "problemes": [], "recommandations": [] },
    "copywriting": { "analyse": "", "problemes": [], "recommandations": [] },
    "mobile_ux": { "analyse": "", "problemes": [], "recommandations": [] },
    "fiche_produit": { "analyse": "", "problemes": [], "recommandations": [] },
    "checkout": { "analyse": "", "problemes": [], "recommandations": [] },
    "confiance": { "analyse": "", "problemes": [], "recommandations": [] }
  },
  "leviers_cro_prioritaires": [
    {
      "titre": "",
      "probleme": "",
      "description": "",
      "mecanisme_psychologique": "",
      "impact_business_probable": "",
      "priorite": "P1|P2|P3"
    }
  ],
  "quick_wins": [
    {
      "action": "",
      "impact": "",
      "facilite_implementation": "faible|moyenne|élevée"
    }
  ],
  "tests_ab_recommandes": [
    {
      "hypothese": "",
      "variation": "",
      "objectif": "",
      "kpi": ""
    }
  ],
  "limitations": []
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API error:', error);
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
