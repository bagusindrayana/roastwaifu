import { json, error } from "@sveltejs/kit";
import axios from "axios";
import { RateLimiter } from 'sveltekit-rate-limiter/server';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { OPENAI_PROXY_URL, OPENAI_MODEL, OPEN_AI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';

const limiter = new RateLimiter({
    // A rate is defined as [number, unit]
    IP: [15, 'm'], // IP address limiter
    IPUA: [10, 'm'], // IP + User Agent limiter
});



function infoIndo(body: any) {
    let info = "Nama : " + body.characterInfo.data.name + " dengan biodata : " + body.characterInfo.data.about;
    if (body.characterInfo.data.anime.length > 0) {
        info = info + ", dari anime : " + body.characterInfo.data.anime[0].anime.title + " sebagai " + body.characterInfo.data.anime[0].role
    }
    if (body.characterInfo.data.manga.length > 0) {
        info = info + ", dari manga : " + body.characterInfo.data.manga[0].manga.title + " sebagai " + body.characterInfo.data.manga[0].role
    }
    return info;
}

function infoInggris(body: any) {
    let info = "Name : " + body.characterInfo.data.name + " with bio : " + body.characterInfo.data.about;
    if (body.characterInfo.data.anime.length > 0) {
        info = info + ", from anime : " + body.characterInfo.data.anime[0].anime.title + " as " + body.characterInfo.data.anime[0].role
    }
    if (body.characterInfo.data.manga.length > 0) {
        info = info + ", from manga : " + body.characterInfo.data.manga[0].manga.title + " as " + body.characterInfo.data.manga[0].role
    }
    return info;
}

export const POST: RequestHandler = async (event) => {
    const allowedOrigins = ['https://roastwaifu.vercel.app', 'roastwaifu.vercel.app', 'roastwaifu.my.id', 'https://roastwaifu.my.id'];
    const origin = event.request.headers.get('origin');
    const headersCors: {
        'Access-Control-Allow-Methods': string;
        'Access-Control-Allow-Headers': string;
        'Access-Control-Allow-Origin'?: string;
    } = {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (dev) {
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
    let prompt = "berikan roasting singkat dengan kejam,menyindir, serta menyakitkan dalam bahasa gaul untuk karakter berikut : " + infoIndo(body) + ". (hanya berikan response singkat dengan bahasa indonesia. jangan berikan pujian apapun. response tidak lebih dari 100 kata)";
    if (body.language == "english") {
        prompt = "give a short and harsh roasting for the following character : " + infoInggris(body) + ". (only give short response with english language. dont give any praise.response not more than 100 words)";
    }
    try {
        // kalau mau pakei api gratisan
        // const url = "https://api.nyxs.pw/ai/gemini?text=" + prompt;
        // const response = await axios.get(url);
        // const data = await response.data;
        // return json({
        //     roasting: data.result
        // },{
        //     headers: headersCors
        // });

        const client = new OpenAI({
            apiKey: OPEN_AI_API_KEY != "NULL" ? OPEN_AI_API_KEY : "",
            baseURL: OPENAI_PROXY_URL ?? 'https://api.openai.com',
        });

        const chatCompletion = await client.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: OPENAI_MODEL ?? 'gpt-4o-mini',
        });
        const data = chatCompletion.choices[0];


        return json({
            roasting: data.message.content
        }, {
            headers: headersCors
        });

    } catch (error: any) {
        return json({
            error: error.message
        }, {
            status: 500,
            headers: headersCors
        });
    }
}