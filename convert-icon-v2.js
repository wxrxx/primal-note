import Jimp from 'jimp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';

async function processIcon() {
    try {
        const inputPath = path.resolve('public/icons/icon.png');
        console.log(`Reading image from ${inputPath}...`);

        // Jimp auto-detects format, so it should read the JPEG even with .png extension
        const image = await Jimp.read(inputPath);

        // Resize to square if needed (usually is, but good to ensure)
        // Icons should be square.
        // Save as true PNG
        const pngPath = path.resolve('public/icons/icon-fixed.png');
        console.log(`Writing true PNG to ${pngPath}...`);
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
