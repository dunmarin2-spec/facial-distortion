export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) return res.status(500).json({ error: "API 토큰이 세팅되지 않았습니다." });

    try {
        if (req.body.predictionId) {
            const pollResponse = await fetch("https://api.replicate.com/v1/predictions/" + req.body.predictionId, {
                headers: { "Authorization": `Token ${REPLICATE_API_TOKEN}` }
            });
            const prediction = await pollResponse.json();
            
            // 에러 나면 에러 코드 그대로 던지기!
            if (!pollResponse.ok) return res.status(pollResponse.status).json(prediction);
            return res.status(200).json(prediction);
        }

        const { image, style } = req.body;
        
        // 🎨 [스타일별 초강력 고퀄리티 프롬프트 세팅]
        let promptText = "";
        if (style === 'ghibli') {
            promptText = "official art by Studio Ghibli, masterwork by Hayao Miyazaki, stunning anime art, hand-painted aesthetic, watercolor background, detailed character design, cinematic lighting, vibrant colors, 8k resolution, highly detailed features, masterpiece, sharp focus";
        } else if (style === 'webtoon') {
            promptText = "Korean webtoon style, cel shading, clear outlines, dramatic lighting, high quality manhwa art, detailed manga style, vibrant colors";
        } else if (style === 'disney') {
            promptText = "Disney Pixar 3D animation style, cute character, high quality 3D rendering, octane render, unreal engine 5, masterpiece, volumetric lighting";
        } else {
            promptText = "Studio Ghibli style, anime, beautiful, highly detailed, vivid colors, masterpiece"; // 혹시 모를 기본값
        }

        const response = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${REPLICATE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // 🚨 전 세계에서 가장 많이 쓰고 절대 안 터지는 SDXL 1.0 공식 버전 ID
                version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", 
                input: {
                    image: image,
                    prompt: promptText,
                    
                    // 🚨 [필수 추가] 19금 차단 & 쓰레기 결과물 방지용 강력한 방어막
                    negative_prompt: "nsfw, nude, naked, cleavage, bare skin, ugly, deformed, disfigured, low quality, bad anatomy, bad hands, cartoon, low resolution, blurry, overexposed, horror, scary", 
                    
                    // 💡 [형님 팁] 나 같지가 않으면 숫자를 0.4로 내리시고, 만화 느낌이 부족하면 0.6으로 올리십쇼!
                    prompt_strength: 0.4, 
                    
                    num_inference_steps: 25
                }
            }),
        });

        const prediction = await response.json();
        
        // 에러 나면 에러 코드 그대로 던지기!
        if (!response.ok) return res.status(response.status).json(prediction);
        
        return res.status(200).json(prediction); 

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
    }
}
