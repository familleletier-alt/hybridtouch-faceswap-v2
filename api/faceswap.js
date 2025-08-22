export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { source_image, target_image } = req.body;

    console.log('🔄 Début FaceSwap avec Hugging Face');
    console.log('👤 Avatar:', source_image?.substring(0, 50) + '...');
    console.log('🖼️ Upload:', target_image?.substring(0, 50) + '...');

    if (!source_image || !target_image) {
      return res.status(400).json({ 
        success: false, 
        error: 'Images source et cible requises' 
      });
    }

    // Appel à Hugging Face FaceSwap
    const response = await fetch(
      "https://api-inference.huggingface.co/models/deepinsight/insightface",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: {
            source_image: source_image,
            target_image: target_image
          }
        }),
      }
    );

    console.log('📊 Statut Hugging Face:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur Hugging Face:', errorText);
      throw new Error(`Hugging Face error: ${response.status} - ${errorText}`);
    }
    
    // Récupération de l'image résultat
    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    
    console.log('✅ FaceSwap terminé avec succès');

    return res.status(200).json({
      success: true,
      output_url: dataUrl,
      processing_time: 'Variable'
    });

  } catch (error) {
    console.error('❌ Erreur complète:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
