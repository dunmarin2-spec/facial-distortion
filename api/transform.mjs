export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) return res.status(500).json({ error: "API 토큰이 세팅되지 않았습니다." });

    try {
        // 1. 상태 확인 (Polling) 요청인 경우
        if (req.body.predictionId) {
            const pollResponse = await fetch("https://api.replicate.com/v1/predictions/" + req.body.predictionId, {
                headers: { "Authorization": `Token ${REPLICATE_API_TOKEN}` }
            });
            const prediction = await pollResponse.json();
            return res.status(200).json(prediction);
        }

        // 2. 처음 그림 주문 넣는 경우
        const { image, style } = req.body;
        let promptText = "";
        if (style === 'ghibli') promptText = "Studio Ghibli style, anime, beautiful, highly detailed, vivid colors, masterpiece";
        else if (style === 'webtoon') promptText = "Korean webtoon style, cel shading, clear outlines, dramatic lighting";
        else if (style === 'disney') promptText = "Disney Pixar 3D animation style, cute character, high quality 3D rendering";

        const response = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${REPLICATE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // 가장 빠르고 안정적인 SDXL 모델 버전
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
        return res.status(200).json(prediction); 

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
    }
}
