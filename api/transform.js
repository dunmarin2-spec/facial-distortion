// api/transform.js
// 이 코드는 Vercel 환경에서 '서버리스 함수'로 작동합니다.

export default async function handler(req, res) {
    // POST 요청만 받습니다.
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { image, style } = req.body;

    // 형님, 여기에 선택한 스타일에 따라 AI에게 내릴 '프롬프트(명령어)'를 세팅합니다.
    let promptText = "";
    if (style === 'ghibli') {
        promptText = "Studio Ghibli style, anime, beautiful, highly detailed, vivid colors, masterpiece";
    } else if (style === 'webtoon') {
        promptText = "Korean webtoon style, cel shading, clear outlines, dramatic lighting";
    } else if (style === 'disney') {
        promptText = "Disney Pixar 3D animation style, cute character, high quality 3D rendering";
    }

    try {
        /* ======================================================================
        ⚠️ [중요 안내] ⚠️
        여기가 핵심입니다! 직접 AI를 폰이나 브라우저에서 돌리는 건 불가능합니다.
        대신 'Replicate' 같은 AI 전용 서비스에 API 요청을 보내서 그림을 받아와야 합니다.
        
        아래는 Replicate API를 호출하는 가상의 뼈대 코드입니다.
        실제로 작동시키려면 Replicate 회원가입 후 'REPLICATE_API_TOKEN'을 발급받아
        버셀(Vercel) 환경 변수에 등록해야 합니다.
        ======================================================================
        */
        
        const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN; // 버셀에 세팅할 비밀키

        if (!REPLICATE_API_TOKEN) {
            return res.status(500).json({ error: "API 토큰이 없습니다. Replicate 토큰을 세팅해주세요." });
        }

        // AI 모델(예: SDXL Image-to-Image)에 요청을 보냅니다.
        const response = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${REPLICATE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: "a9758cbfbd5f3c2094457d996681af52552901775aa2d6dd0b17fd15df959bef", // SDXL 모델 주소 (예시)
                input: {
                    image: image, // 형님이 찍은 사진
                    prompt: promptText, // 화풍 명령어
                    prompt_strength: 0.6 // 원본 사진을 얼마나 유지할지 (0~1)
                }
            }),
        });

        let prediction = await response.json();

        // AI가 그림을 그리는 데 시간이 걸리므로, 완료될 때까지 반복해서 물어봐야 합니다(Polling).
        while (
            prediction.status !== "succeeded" &&
            prediction.status !== "failed"
        ) {
            await new Promise((r) => setTimeout(r, 1000)); // 1초 대기
            const pollResponse = await fetch(
                "https://api.replicate.com/v1/predictions/" + prediction.id,
                {
                    headers: { "Authorization": `Token ${REPLICATE_API_TOKEN}` },
                }
            );
            prediction = await pollResponse.json();
        }

        if (prediction.status === "succeeded") {
            // 변환된 이미지 URL을 화면(프론트엔드)으로 보냅니다!
            return res.status(200).json({ outputUrl: prediction.output[0] });
        } else {
            return res.status(500).json({ error: "AI 변환에 실패했습니다." });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
    }
}
