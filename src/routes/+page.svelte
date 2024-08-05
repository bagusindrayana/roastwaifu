<script lang="ts">
    import SelectWaifu from "../components/SelectWaifu.svelte";
    import SvelteMarkdown from "svelte-markdown";

    let animeUrl = "https://api.jikan.moe/v4";
    let backendUrl = "";

    let waifuId: number = 1;
    let language: string = "auto";
    let roastingResult: string = "";
    let status: string = "idle";
    let selectedCharacter: any = null;

    function onSelectWaifu(option: any) {
        waifuId = option.id;
    }

    //get waifu by id
    async function getWaifuById(id: number) {
        status = "character";
        const response = await fetch(`${animeUrl}/characters/${id}/full`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    }

    //roasting
    async function roastWaifu() {
        const characterInfo = await getWaifuById(waifuId);
        selectedCharacter = characterInfo;
        status = "roasting";
        //fetch to /roasting with character info data
        try {
            const response = await fetch(`${backendUrl}/roasting`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    language: language,
                    characterInfo: characterInfo,
                }),
            });

            const data = await response.json();
            roastingResult = data.roasting;
            
        } catch (error:any) {
            console.error("Error roasting waifu:", error);
            roastingResult = error.message;
        }
        status = "done";
    }
</script>

<svelte:head>
    <title>Roasting Your Waifu/Husbando ❤️‍🔥❤️‍🔥❤️‍🔥</title>
</svelte:head>
<main>
    <h1>Roasting Your Waifu/Husbando ❤️‍🔥❤️‍🔥❤️‍🔥</h1>
    <div class="mb-1">
        <SelectWaifu
            placeholder="Search Waifu & Husbando"
            onSelect={onSelectWaifu}
        />
    </div>

    <details class="mb-1">
        <summary>Setting</summary>

        <div class="input-group">
            <label for="language">Language</label>
            <select bind:value={language} name="language" id="language">
                <option value="auto">Auto</option>
                <option value="english">English</option>
                <option value="indonesia">Indonesia</option>
            </select>
        </div>
    </details>

    <button on:click={roastWaifu}>Roasting ❤️‍🔥</button>

    {#if status == "done"}
        <h2>Roasting Result</h2>
        <img
            style="max-height: 200px;"
            src={selectedCharacter.data.images.webp.image_url}
            alt="{selectedCharacter.data.name} Picture"
        />
        <SvelteMarkdown source={roastingResult} />
    {:else if status != "idle"}
        <p>Loading...</p>
    {/if}
</main>

<style>
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #dbd7d7;
    }
    main {
        display: block;
        margin: auto;
        max-width: 800px;
    }
    input {
        margin-right: 0.5em;
        padding: 0.5em;
    }
    button {
        padding: 0.5em;
    }
    .mb-1 {
        margin-bottom: 1rem;
    }
    .input-group {
        margin-bottom: 16px;
        display: flex;
        gap: 6px;
        flex-direction: column;
    }
</style>
