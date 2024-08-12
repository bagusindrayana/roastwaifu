<script lang="ts">
    import "../app.css";
    import axios from "axios";
    import SelectWaifu from "../components/SelectWaifu.svelte";
    import SvelteMarkdown from "svelte-markdown";

    let animeUrl = "https://api.jikan.moe/v4";
    let backendUrl = "";

    let waifuId: number = 1;
    let language: string = "english";
    let roastingResult: string = "";
    let isLoading = false;
    let selectedCharacter: any = null;

    function onSelectWaifu(option: any) {
        waifuId = option.id;
    }

    async function getWaifuById(id: number) {
        isLoading = true;
        const response = await axios.get(`${animeUrl}/characters/${id}/full`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.data;
        return data;
    }

    async function roastWaifu() {
        isLoading = true;
        try {
            const characterInfo = await getWaifuById(waifuId);

            const response = await axios.post(`${backendUrl}/roasting`, {
                    language: language,
                    characterInfo: characterInfo,
                },{
                headers: {
                    "Content-Type": "application/json",
                },
            });
            selectedCharacter = characterInfo;
            const data = await response.data;
            roastingResult = data.roasting;
        } catch (error: any) {
            selectedCharacter = null;
            isLoading = false;
            console.error("Error roasting waifu:", error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 504) {
                    roastingResult = "Response timeout, please try again";
                } else if (error.response?.status === 429) {
                    roastingResult = "Too many request, please try again later";
                } else {
                    roastingResult = error.response?.data.message ?? error.response?.data.error;
                }
            } else {
                roastingResult = error.message;
            }
        }
        isLoading = false;
    }
</script>

<svelte:head>
    <title>Roasting Your Waifu/Husbando ❤️‍🔥❤️‍🔥❤️‍🔥</title>
</svelte:head>
<main class="bg-gray-100 font-sans min-h-lvh flex flex-col justify-center">
    <div class="container mx-auto p-4 max-w-2xl">
        <h1 class="text-3xl font-bold text-center mb-6">
            Roasting Your Waifu/Husbando ❤️‍🔥
        </h1>

        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <label
                class="block text-sm font-medium text-gray-700 mb-1"
                for="waifu"
            >
                Select Waifu & Husbando
            </label>
            <div class="mb-1">
                <SelectWaifu placeholder="Search..." onSelect={onSelectWaifu} />
            </div>
            <div class="mb-4">
                <label
                    class="block text-sm font-medium text-gray-700 mb-1"
                    for="language"
                >
                    Language
                </label>
                <select
                    class="w-full p-2 border rounded"
                    bind:value={language}
                    name="language"
                    id="language"
                >
                    <option value="indonesia">Indonesia</option>
                    <option value="english">English</option>
                </select>
            </div>

            <button
                disabled={isLoading}
                on:click={roastWaifu}
                class="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
            >
                {isLoading ? "Roasting..." : "Roast ❤️‍🔥"}
            </button>
        </div>

        {#if roastingResult != ""}
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-2xl font-semibold mb-4">Roasting Result</h2>
                <div
                    class="flex flex-col md:flex-row items-center justify-center space-x-4"
                >
                    {#if selectedCharacter != null}
                        <img
                            style="max-height: 200px;"
                            src={selectedCharacter.data.images.webp.image_url}
                            alt="{selectedCharacter.data.name} Picture"
                        />
                    {/if}
                    <p class="text-sm">
                        <SvelteMarkdown source={roastingResult} />
                    </p>
                </div>
            </div>
        {/if}
    </div>
    <div class="flex justify-center gap-2 items-center">
        <a href="https://trakteer.id/bagood" target="_blank"
            ><img
                id="wse-buttons-preview"
                src="https://cdn.trakteer.id/images/embed/trbtn-red-1.png?date=18-11-2023"
                height="40"
                style="border: 0px; height: 40px; --darkreader-inline-border-top: 0px; --darkreader-inline-border-right: 0px; --darkreader-inline-border-bottom: 0px; --darkreader-inline-border-left: 0px;"
                alt="Trakteer Saya"
                data-darkreader-inline-border-top=""
                data-darkreader-inline-border-right=""
                data-darkreader-inline-border-bottom=""
                data-darkreader-inline-border-left=""
            /></a
        >
        <iframe
            src="https://ghbtns.com/github-btn.html?user=bagusindrayana&repo=roastwaifu&type=star&count=true&size=large"
            frameborder="0"
            scrolling="0"
            width="170"
            height="30"
            title="GitHub"
        ></iframe>
    </div>
</main>
