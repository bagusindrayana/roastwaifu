import { json,error } from "@sveltejs/kit";
import axios from "axios";
import { RateLimiter } from 'sveltekit-rate-limiter/server';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
const limiter = new RateLimiter({
    // A rate is defined as [number, unit]
    IP: [15, 'm'], // IP address limiter
    IPUA: [10, 'm'], // IP + User Agent limiter
});



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

export const POST: RequestHandler = async (event) => {
    const allowedOrigins = ['https://roastwaifu.vercel.app', 'roastwaifu.vercel.app'];
    const origin = event.request.headers.get('origin');
    const headersCors: {
        'Access-Control-Allow-Methods': string;
        'Access-Control-Allow-Headers': string;
        'Access-Control-Allow-Origin'?: string;
    } = {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if(dev){
        headersCors['Access-Control-Allow-Origin'] = '*';
    } else {
        if (!allowedOrigins.includes(origin ?? '')) {
            error(403, 'Forbidden');
        } else {
            headersCors['Access-Control-Allow-Origin'] = origin!;
        }
    }
    //limit request
    if (await limiter.isLimited(event)) {
        error(429, 'Too Many Requests');
    }
    const body = await event.request.json();
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
        },{
            headers: headersCors
        });
      
    } catch (error: any) {
        return json({
            error: error.message
        },{
            status: 500,
            headers: headersCors
        });
    }
}