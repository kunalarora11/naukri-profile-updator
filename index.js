const express = require('express');
const puppeteer = require ('puppeteer');
const cron = require('node-cron');

const username = ''; // username or email
const password = ''; // password
const path = ''; // path of the cv

const app = express();

const PORT = 3000

const updateProfile = async (req, res) => {
    let browser;
    try {

        // Launch the browser and open a new blank page
        browser = await puppeteer.launch({ headless: true }) // change to false if you want to see the process

        const page = await browser.newPage();

        // Navigate to Naukri login page
        await page.goto('https://www.naukri.com/nlogin/login');

        // Set screen size
        await page.setViewport({ width: 1080, height: 1024 });

        // Wait for login form to load
        await page.waitForSelector('#usernameField');

        // Fill in login credentials and click login button
        await page.type('#usernameField', username);
        await page.type('#passwordField', password);
        await page.click('button[type="submit"]');

        // Wait for login to complete
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        // Navigate to profile edit page
        await page.goto('https://www.naukri.com/mnjuser/profile?id=&altresid', { waitUntil: 'networkidle0' });

        const inputUploadHandle = await page.$('input[type=file]');

        await inputUploadHandle.uploadFile(path);

        // Wait for some time for the profile to update
        await page.waitForTimeout(5000);

        await browser.close();

        if (res) return res.status(200).json({ success: true, message: 'Updated' })
        else return

    } catch (error) {
        console.log('error in updating profile', error);
        await browser.close();
        if (res) return res.status(500).json({ error: true, message: error.message })
        else return
    }
}

app.get('/', updateProfile)

// Schedule the script to run every hour from 8:00 - 11:00 AM
cron.schedule('0 0 8-11 * * *', () => {
    updateProfile();
});

app.listen(PORT, () => {
    console.log(`Server listening on: http://localhost:${PORT}`)
})