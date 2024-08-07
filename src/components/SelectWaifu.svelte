<script lang="ts">
    import { onMount } from "svelte";
    import debounce from "lodash/debounce";

    export let placeholder = "Select an option";
    export let apiUrl = "https://api.jikan.moe/v4/characters";
    export let onSelect = (option: { imageUrl: any; label: any; smallImage: any; id: any; } | null) => {};


    let selectedOption: { imageUrl: any; label: any; smallImage: any; id: any; } | null = null;
    export let searchTerm = "";

    let options: any[] = [];
    let isLoading = false;
    let isOpen = false;

 

    async function fetchOptions(query: string) {
        isLoading = true;
        try {
            const response = await fetch(`${apiUrl}?q=${query}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) throw new Error("Failed to fetch options");
            const results = await response.json();
            options = results.data;
        } catch (error) {
            console.error("Error fetching options:", error);
            options = [];
        } finally {
            isLoading = false;
        }
    }

    const debouncedFetch = debounce(fetchOptions, 300);

    $: {
        debouncedFetch(searchTerm);
    }

    const handleSelect = (
        option: { imageUrl: any; label: any; smallImage: any; id: any; } | null,
    ) => {
        selectedOption = option;
        isOpen = false;
        onSelect(option);
    };

    const toggleDropdown = () => {
        isOpen = !isOpen;
        if (isOpen && options.length === 0) {
            fetchOptions("");
        }
    };

    // onMount(() => {
    //     fetchOptions("");
    // });
</script>

<div class="select-container">
    <div class="select-input" on:click={toggleDropdown}>
        {#if selectedOption}
            <img
                src={selectedOption.smallImage}
                alt={selectedOption.label}
                class="option-image"
            />
            <span>{selectedOption.label}</span>
        {:else}
            <span>{placeholder}</span>
        {/if}
    </div>

    {#if isOpen}
        <div class="dropdown">
            <input
                type="text"
                bind:value={searchTerm}
                placeholder="Search..."
                class="search-input"
            />
            {#if isLoading}
                <div class="loading">Loading...</div>
            {:else if options.length === 0}
                <div class="no-results">No results found</div>
            {:else}
                <ul class="options-list">
                    {#each options as option , index (index)}
                        <li on:click={() => handleSelect({label:option.name,imageUrl:option.images.webp.image_url,smallImage: option.images.webp.small_image_url,id:option.mal_id})}>
                            <img
                                src={option.images.webp.small_image_url}
                                alt={option.name}
                                class="option-image"
                            />
                            <span>{option.name}</span>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    {/if}
</div>

<style>
    .select-container {
        position: relative;
        width: 100%;
    }

    .select-input {
        display: flex;
        align-items: center;
        padding: 8px;
        border: 1px solid #ccc;
        cursor: pointer;
        border-radius: 4px;
    }

    .dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        border: 1px solid #ccc;
        background-color: white;
        z-index: 1000;
    }

    .search-input {
        width: 100%;
        padding: 8px;
        border: none;
        border-bottom: 1px solid #ccc;
    }

    .options-list {
        max-height: 200px;
        overflow-y: auto;
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    .options-list li {
        display: flex;
        align-items: center;
        padding: 8px;
        cursor: pointer;
    }

    .options-list li:hover {
        background-color: #f0f0f0;
    }

    .option-image {
        width: 30px;
        height: 30px;
        margin-right: 10px;
        object-fit: cover;
    }

    .loading,
    .no-results {
        padding: 8px;
        text-align: center;
    }
</style>
