// NOUVEAU CODE - Sans clé API nécessaire
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { source_image, target_image } = req.body;

    if (!source_image || !target_image) {
      return res.status(400).json({ 
        success: false, 
        error: 'source_image et target_image sont requis' 
      });
    }

    // Appel à un service public de FaceSwap (plus simple, sans clé)
    const response = await fetch('https://faceswap.stablecog.com/api/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_image,
        target_image
      })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Erreur du service de swap:", errorBody);
        throw new Error(`Le service de FaceSwap a échoué: ${response.statusText}`);
    }

    // Le service renvoie directement l'image, pas un JSON
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    return res.status(200).json({
      success: true,
      output_url: dataUrl,
    });

  } catch (error) {
    console.error('Erreur FaceSwap V2 (sans clé):', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
