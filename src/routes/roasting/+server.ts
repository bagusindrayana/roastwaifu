import { json, error } from "@sveltejs/kit";
import axios from "axios";
import { RateLimiter } from 'sveltekit-rate-limiter/server';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { GEMINI_AI_KEY } from '$env/static/private';
import { GoogleGenerativeAI, GoogleGenerativeAIResponseError, HarmCategory, HarmBlockThreshold, GoogleGenerativeAIError } from "@google/generative-ai";

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

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ];
        //split coma and get one random key
        const geminiApiKeys = GEMINI_AI_KEY.split(",");
        const randomGeminiApiKey = geminiApiKeys[Math.floor(Math.random() * geminiApiKeys.length)];
        let genAI = new GoogleGenerativeAI(randomGeminiApiKey);
        const modelAi = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });
        const result = await modelAi.generateContent(prompt);
        const response = await result.response;


        return json({
            roasting: response.text()
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