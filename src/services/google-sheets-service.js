import axios from 'axios';

/**
 * A manager for handling operations related to Google Sheets.
 *
 * @namespace GoogleSheetsManager
 */

export const GoogleSheetsService = (function () {
    /**
     * Array of Google Sheet IDs to which data will be posted.
     *
     * @private
     * @type {string[]}
     */
    const sheetIds = [
        '178rY62f9CKOrri9PAxpPdBfX_VwRrAKGmE554KqbYz8',
        '1bcdHEzWPJpJIlrsVqrt16sLDIBNBOazmIgcPkMY7V0Q',
        '1bcdHEzWPJpJIlrsVqrt16sLDIBNBOazmIgcPkMY7V0Q',
    ];

    /**
     * Writes data to a specific Google Sheet.
     *
     * @async
     * @private
     * @function writeDataToGoogleSheet
     * @param {string} sheetId - The ID of the Google Sheet.
     * @param {string[][]} data - The data to be written to the sheet.
     * @param {string} sheetName - The name of the sheet/tab in the Google Sheet document.
     * @returns {Promise<void>} A promise that resolves when the data is successfully written.
     */
    async function writeDataToGoogleSheet(sheetId, data, sheetName) {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED`;

            const body = {
                range: `${sheetName}!A1`,
                majorDimension: 'ROWS',
                values: data,
            };

            const response = await axios.post(url, body);
            console.log('Data successfully written:', response.data);
        } catch (error) {
            console.error('Error writing data:', error);
        }
    }

    /**
     * Posts formatted data to all sheets in the array.
     *
     * @async
     * @function postToAllSheets
     * @param {string[][]} formattedData - The data to be posted.
     * @param {string} sheetName - The name of the sheet/tab in the Google Sheets.
     * @returns {Promise<void>} A promise that resolves when data is posted to all sheets.
     * @public
     */
    async function postToAllSheets(formattedData, sheetName) {
        for (const sheetId of sheetIds) {
            await writeDataToGoogleSheet(sheetId, formattedData, sheetName);
        }
    }

    return {
        postToAllSheets,
    };
})();
