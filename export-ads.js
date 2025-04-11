const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Make sure the output directory exists
const outputDir = path.join(__dirname, 'ad-images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

(async () => {
  // Launch the browser
  const browser = await puppeteer.launch();
  
  // List of HTML files to convert
  const adFiles = [
    { input: 'ads/twitter-ad.html', output: 'ad-images/twitter-ad.png', width: 1200, height: 628 },
    { input: 'ads/reddit-ad.html', output: 'ad-images/reddit-ad.png', width: 1200, height: 1000 },
    { input: 'ads/linkedin-ad.html', output: 'ad-images/linkedin-ad.png', width: 1200, height: 1000 }
  ];
  
  // Process each ad
  for (const adFile of adFiles) {
    try {
      console.log(`Converting ${adFile.input} to PNG...`);
      
      // Create a new page
      const page = await browser.newPage();
      
      // Set the viewport size - make it larger to ensure all content is visible
      await page.setViewport({
        width: adFile.width,
        height: adFile.height,
        deviceScaleFactor: 2 // Higher quality images
      });
      
      // Navigate to the HTML file
      await page.goto(`file://${path.join(__dirname, adFile.input)}`, {
        waitUntil: 'networkidle0'
      });
      
      // Wait a moment for any fonts to load completely
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Take a screenshot - using clip to ensure exact dimensions
      await page.screenshot({
        path: adFile.output,
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: adFile.width,
          height: adFile.height
        },
        omitBackground: false
      });
      
      console.log(`${adFile.input} successfully converted to ${adFile.output}`);
      
      // Close the page
      await page.close();
    } catch (error) {
      console.error(`Error processing ${adFile.input}:`, error);
    }
  }
  
  // Close the browser
  await browser.close();
  console.log('All ads converted successfully!');
})(); 