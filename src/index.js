import { TariffDataService } from '#services/tariff-data-service.js';

/** Handles the data fetching process and allows periodic execution. */
const DataFetcher = {
    /**
     * Main method to start the data fetching process and handle errors.
     *
     * @async
     */
    async start() {
        try {
            console.log('Starting the data fetching process...');
            await TariffDataService.fetchAndProcessTariffData();
            console.log('Data fetching and processing completed successfully.');
        } catch (error) {
            console.error('Error in main process:', error);
        }
    },

    /**
     * Sets up a periodic task to fetch data every hour.
     *
     * @param {number} intervalMs - The interval time in milliseconds.
     */
    startPeriodicFetching(intervalMs = 60 * 60 * 1000) {
        this.start(); // Run immediately
        setInterval(() => {
            this.start();
        }, intervalMs);
    },
};

DataFetcher.startPeriodicFetching();
