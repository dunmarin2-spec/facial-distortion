export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) return res.status(500).json({ error: "API 토큰이 세팅되지 않았습니다." });

    try {
        // [수정된 부분 1] 브라우저가 "그림 다 그렸어?" 하고 상태를 물어볼 때 (주문 번호가 있을 때)
        if (req.body.predictionId) {
            const pollResponse = await fetch("https://api.replicate.com/v1/predictions/" + req.body.predictionId, {
                headers: { "Authorization": `Token ${REPLICATE_API_TOKEN}` }
            });
            const prediction = await pollResponse.json();
            return res.status(200).json(prediction); // 현재 상태 바로 반환
        }

        // [수정된 부분 2] 처음 사진을 보내서 "그림 그려줘!" 주문을 넣을 때
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
    // [가장 안정적인 SDXL 모델 버전입니다]
    version: "7762fd0e0e351637c4701f6613ad79040a8d45151ea22b37805177c4416345a4", 
    input: {
        image: image,
        prompt: promptText,
        // 아래 설정 이름들이 모델마다 다를 수 있어서 가장 기본만 남깁니다
        num_inference_steps: 20, 
        guidance_scale: 7.5,
        prompt_strength: 0.5 
    }
}),

        const prediction = await response.json();
        // 기다리지 않고 주문 내역을 바로 브라우저로 던집니다! (버셀 타임아웃 방지)
        return res.status(200).json(prediction); 

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
    }
}
