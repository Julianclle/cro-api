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
    // Support les deux formats : { url } et { urlHome, homeContent, productContent }
    const {
      url,
      urlHome,
      homeContent,
      productContent,
      niche,
      visiteurs,
      cvr_actuel,
      panier_moyen,
      cvr_cible
    } = req.body;

    const finalUrl = url || urlHome || 'URL non fournie';

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

    // Contenu réel de la page si disponible
    const pageContext = homeContent ? `
# CONTENU RÉEL DE LA HOMEPAGE
Voici le contenu HTML/texte extrait de la homepage de ${finalUrl}. Utilise-le pour faire une analyse précise et spécifique :
<homepage_content>
${homeContent.slice(0, 6000)}
</homepage_content>
${productContent ? `
# CONTENU RÉEL D'UNE FICHE PRODUIT
<product_content>
${productContent.slice(0, 3000)}
</product_content>` : ''}
` : '';

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
Analyser une boutique e-commerce à partir de son URL et de son contenu réel, puis produire un audit CRO extrêmement pertinent, crédible et actionnable.

Tu ne fais JAMAIS de recommandations génériques.
Tu évites absolument :
- "améliorer l'UX"
- "ajouter des avis"
- "optimiser le parcours"
- "rassurer le client"

Chaque insight doit être :
- spécifique au contenu réel de la page,
- concret,
- relié à un problème observable,
- relié à un mécanisme psychologique,
- relié à un impact business.

Tu raisonnes comme un consultant CRO senior facturant plusieurs milliers d'euros par audit.

LANGUE : Tu réponds UNIQUEMENT en français.

# CONTEXTE

URL : ${finalUrl}
Niche : ${niche}

# DONNÉES BUSINESS

${metriques_block}

${pageContext}

# MÉTHODOLOGIE

Avant de répondre :
1. Analyse le contenu réel fourni ci-dessus pour identifier les vrais problèmes.
2. Identifie les moments de confusion dans le parcours réel.
3. Détecte les frictions cognitives observables dans le contenu.
4. Analyse la vitesse de compréhension de l'offre telle qu'elle est rédigée.
5. Analyse la hiérarchie visuelle décrite dans le HTML.
6. Analyse la qualité de persuasion du copywriting existant.
7. Analyse les signaux de confiance présents ou absents.
8. Analyse les points de fuite potentiels.
9. Priorise les problèmes selon leur impact probable sur une boutique de niche ${niche}.
10. Déduis les optimisations à plus fort ROI basées sur le contenu réel.

# RÈGLES IMPORTANTES

- Baser chaque recommandation sur le contenu réel analysé.
- Ne jamais inventer de données business.
- Ne jamais donner de conseils vagues.
- Toujours être spécifique à la boutique ${finalUrl} dans la niche ${niche}.
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
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
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
