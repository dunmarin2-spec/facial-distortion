// transform.mjs 수정본 (이걸로 전체 덮어쓰기 하십쇼)
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
            
            // [수정 포인트] 에러 나면 에러 코드 그대로 던지기!
            if (!pollResponse.ok) return res.status(pollResponse.status).json(prediction);
            return res.status(200).json(prediction);
        }

        const { image, style } = req.body;
        let promptText = "Studio Ghibli style, anime, beautiful, highly detailed, vivid colors, masterpiece"; // 기본값
        if (style === 'webtoon') promptText = "Korean webtoon style, cel shading, clear outlines, dramatic lighting";
        else if (style === 'disney') promptText = "Disney Pixar 3D animation style, cute character, high quality 3D rendering";

        const response = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${REPLICATE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: "7762fd0e0e351637c4701f6613ad79040a8d45151ea22b37805177c4416345a4", 
                input: {
                    image: image,
                    prompt: promptText,
                    num_inference_steps: 20, 
                    guidance_scale: 7.5,
                    prompt_strength: 0.5 
                }
            }),
        });

        const prediction = await response.json();
        
        // [수정 포인트] 에러 나면 에러 코드 그대로 던지기!
        if (!response.ok) return res.status(response.status).json(prediction);
        
        return res.status(200).json(prediction); 

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
    }
}
