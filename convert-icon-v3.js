import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Jimp = require('jimp');
const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

async function processIcon() {
    try {
        const inputPath = path.resolve('public/icons/icon.png');
        console.log(`Reading image from ${inputPath}...`);

        // Jimp should read the file (even if misnamed)
        const image = await Jimp.read(inputPath);

        // Save as true PNG
        const pngPath = path.resolve('public/icons/icon-fixed.png');
        console.log(`Writing true PNG to ${pngPath}...`);
        // Resize to 256x256 to be safe for ICO tools
        image.resize(256, 256);
        await image.writeAsync(pngPath);

        // Convert to ICO
        console.log('Converting to ICO...');
        const buf = await pngToIco(pngPath);
        fs.writeFileSync(path.resolve('public/icons/icon.ico'), buf);

        // Rename fixed png to original name
        fs.renameSync(pngPath, inputPath);

        console.log('Success! Created icon.png (valid) and icon.ico');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

processIcon();
