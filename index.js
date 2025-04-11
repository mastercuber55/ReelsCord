import { ApifyClient } from 'apify-client';

// Initialize the ApifyClient with API token
const client = new ApifyClient({
    token: 'TOKEN',
});

// Prepare Actor input
const input = {
    "reelLinks": [
        "https://www.instagram.com/reel/DD3Iy3aROKi/"
    ],
    "proxyConfiguration": {
        "useApifyProxy": true
    },
    "verboseLog": false
};

(async () => {
    // Run the Actor and wait for it to finish
    const run = await client.actor("tK6UBWwvP7CwokYEK").call(input);

    // Fetch and print Actor results from the run's dataset (if any)
    console.log('Results from dataset');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    items.forEach((item) => {
        console.dir(item);
    });
})();