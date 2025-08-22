// Nouveau service proxy - Version 2
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

    // Utilisation de l'API DeepSwapper (alternative à Replicate)
    const response = await fetch('https://api.deepswapper.com/v1/faceswap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSWAPPER_API_KEY}` // Nouvelle clé API
      },
      body: JSON.stringify({
        source_image_url: source_image,
        target_image_url: target_image,
        face_enhance: true,
        background_enhance: false
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSwapper API error: ${response.statusText}`);
    }

    const result = await response.json();

    return res.status(200).json({
      success: true,
      output_url: result.result_url,
      processing_time: result.processing_time || 'N/A'
    });

  } catch (error) {
    console.error('Erreur FaceSwap V2:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
