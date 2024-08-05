import { json } from "@sveltejs/kit";
import { GEMINI_API_KEY } from '$env/static/private';
import { GoogleGenerativeAI, GoogleGenerativeAIResponseError, HarmCategory, HarmBlockThreshold, GoogleGenerativeAIError } from '@google/generative-ai';

export function GET() {
    return new Response('Hello from the server!', {
        headers: { 'content-type': 'text/plain' },
    });
}

function infoIndo(body: any) {
    let info = "karakternya adalah : " + body.characterInfo.data.name + " dengan biodata : " + body.characterInfo.data.about;
    if (body.characterInfo.data.anime.length > 0) {
        info = info + ", anime : " + body.characterInfo.data.anime[0].anime.title + " sebagai " + body.characterInfo.data.anime[0].role
    }
    if (body.characterInfo.data.manga.length > 0) {
        info = info + ", manga : " + body.characterInfo.data.manga[0].manga.title + " sebagai " + body.characterInfo.data.manga[0].role
    }
    return info;
}

function infoInggris(body: any) {
    let info = "the character is : " + body.characterInfo.data.name + " with bio : " + body.characterInfo.data.about;
    if (body.characterInfo.data.anime.length > 0) {
        info = info + ", anime : " + body.characterInfo.data.anime[0].anime.title + " as " + body.characterInfo.data.anime[0].role
    }
    if (body.characterInfo.data.manga.length > 0) {
        info = info + ", manga : " + body.characterInfo.data.manga[0].manga.title + " as " + body.characterInfo.data.manga[0].role
    }
    return info;
}

export async function POST({ request, cookies }: { request: Request, cookies: any }) {
    const body = await request.json();

    let prompt = "sebagai candaan, tolong roasting dengan kejam serta menyindir dengan bahasa gaul dan gunakan emotikon bila perlu, " + infoIndo(body) + ". (hanya berikan response dengan bahasa indonesia)";
    if (body.language == "english") {
        prompt = "as a joke, please roast with harshly and sarcastic with slang language and use emoticon if needed, " + infoInggris(body) + ". (only give response with english language)";
    }
    try {
        const url = "https://api.nyxs.pw/ai/gpt4?text=" + prompt;
        const response = await fetch(url);
        const data = await response.json();
        return json({
            roasting: data.result
        });
        // let genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // const safetySettings = [
        //     {
        //         category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        //         threshold: HarmBlockThreshold.BLOCK_NONE,
        //     },
        //     {
        //         category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        //         threshold: HarmBlockThreshold.BLOCK_NONE,
        //     },
        // ];
        // const modelAi = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });
        // const result = await modelAi.generateContent(prompt);
        // const response = await result.response;

        // return json({
        //     roasting: response.text()
        // });
    } catch (error: any) {
        return json({
            error: error.message
        });
    }
}