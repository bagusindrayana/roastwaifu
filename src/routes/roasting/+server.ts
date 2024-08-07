import { json } from "@sveltejs/kit";
import axios from "axios";

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
    let prompt = "sebagai candaan, tolong roasting dengan kejam serta menyindir dengan bahasa gaul dan gunakan emotikon bila perlu, " + infoIndo(body) + ". (hanya berikan response dengan bahasa indonesia. response tidak lebih dari 150 kata)";
    if (body.language == "english") {
        prompt = "as a joke, please roast with harshly and sarcastic with slang language and use emoticon if needed, " + infoInggris(body) + ". (only give response with english language. response not more than 150 words)";
    }
    try {
        const url = "https://api.nyxs.pw/ai/gpt4?text=" + prompt;
        const response = await axios.get(url);
        const data = await response.data;
        return json({
            roasting: data.result
        });
      
    } catch (error: any) {
        return json({
            error: error.message
        },{
            status: 500
        });
    }
}