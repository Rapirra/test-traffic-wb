import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

/**
 * A manager for handling operations related to Google Sheets.
 *
 * @namespace GoogleSheetsService
 */

export class GoogleSheetsService {
    /**
     * Creates an instance of GoogleSheetsService.
     *
     * @class
     */
    constructor() {
        this.sheetIds = [
            '178rY62f9CKOrri9PAxpPdBfX_VwRrAKGmE554KqbYz8',
            '1bcdHEzWPJpJIlrsVqrt16sLDIBNBOazmIgcPkMY7V0Q',
            '1bcdHEzWPJpJIlrsVqrt16sLDIBNBOazmIgcPkMY7V0Q',
        ];
        this.client = new google.auth.GoogleAuth({
            keyFile: './src/json/zauirbek-darina-200922-260f1037c960.json',
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
    }

    /**
     * Writes data to a specific Google Sheet.
     *
     * @async
     * @private
     * @param {string} sheetId - The ID of the Google Sheet.
     * @param {string[][]} values - The data to be written to the sheet.
     * @returns {Promise<void>} A promise that resolves when the data is successfully written.
     */
    async writeDataToGoogleSheet(sheetId, values) {
        const googleSheetsApi = google.sheets({ version: 'v4', auth: this.client });
        try {
            const response = googleSheetsApi.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: `A:M`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { range: `A:M`, majorDimension: 'ROWS', values: values },
            });
            console.log('Data successfully written:', response);
        } catch (error) {
            console.error('Error writing data to Google Sheets', error);
        }
    }

    /**
     * Posts formatted data to all sheets in the array.
     *
     * @async
     * @param {string[][]} formattedData - The data to be posted.
     * @returns {Promise<void>} A promise that resolves when data is posted to all sheets.
     */
    async postToAllSheets(formattedData) {
        for (const sheetId of this.sheetIds) {
            await this.writeDataToGoogleSheet(sheetId, formattedData);
        }
    }
}
