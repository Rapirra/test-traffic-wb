import { TariffDataService } from '#services/tariff-data-service.js';
import knexDb from '#knexDB.js';

class DataFetcher {
    constructor() {
        this.migrationsRun = false;
        this.tariffDataService = new TariffDataService();
    }

    /**
     * Main method to start the data fetching process, handle errors, and run migrations.
     *
     * @async
     */
    async start() {
        try {
            if (!this.migrationsRun) {
                await this.runMigration();
                this.migrationsRun = true;
            }

            await this.tariffDataService.fetchAndProcessTariffData();
        } catch (error) {
            console.error('Error in main process:', error);
        }
    }

    /**
     * Run the Knex migration.
     *
     * @async
     */
    async runMigration() {
        try {
            console.log('Running migrations...');
            await knexDb.migrate.latest();
            console.log('Migrations completed successfully.');
        } catch (error) {
            console.error('Error running migrations:', error);
        }
    }

    /**
     * Sets up a periodic task to fetch data every hour.
     *
     * @param {number} intervalMs - The interval time in milliseconds.
     */
    startPeriodicFetching(intervalMs = 60 * 60 * 1000) {
        this.start();
        setInterval(() => {
            console.log('interval', intervalMs);
            this.start();
        }, intervalMs);
    }
}

const dataFetcher = new DataFetcher();
dataFetcher.startPeriodicFetching(60 * 60 * 1000);
