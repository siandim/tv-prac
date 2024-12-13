import { siteCamp } from "./types";

export default async function getCampSite(): Promise<{ siteCamp: siteCamp }> {
    const response = await fetch('https://www.kymesonet.org/json/appSiteCam/appSiteCam.json', {
        cache: 'no-store',  // Ensure no caching to always get the latest data
    });

    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    return { siteCamp: data };
}
