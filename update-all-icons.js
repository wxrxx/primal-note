import { Jimp } from 'jimp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';

async function updateAllIcons() {
    try {
        const inputPath = path.resolve('public/icons/final-logo.png');

        if (!fs.existsSync(inputPath)) {
            console.error('Error: "public/icons/final-logo.png" not found.');
            console.error('Please save your logo with this exact name.');
            process.exit(1);
        }

        console.log(`Reading user logo from ${inputPath}...`);
        const image = await Jimp.read(inputPath);

        // 1. Electron Window Icon (PNG 512x512)
        const electronPngPath = path.resolve('public/icons/icon.png');
        const buildPngPath = path.resolve('build/icon.png');

        console.log('Updating Electron Window Icon...');
        image.resize({ w: 512, h: 512 });
        await image.write(electronPngPath);
        await image.write(buildPngPath); // Backup in build folder

        // 2. Web Favicon (PNG or SVG replacement)
        // Since we have a PNG, let's just write over favicon.svg with a PNG but rename it?
        // Or better, let's keep it simple: overwrite favicon.svg if the user provided an SVG? 
        // No, Jimp reads raster. 
        // Let's create a favicon.png and update index.html to use it if needed, 
        // OR just save as favicon.ico for best web compat.

        const webFaviconPath = path.resolve('public/favicon.ico');
        const webFaviconPngPath = path.resolve('public/favicon.png');

        console.log('Updating Web Favicon...');
        image.resize({ w: 64, h: 64 });
        await image.write(webFaviconPngPath);

        // Create favicon.ico for web
        const faviconBuf = await pngToIco(webFaviconPngPath);
        fs.writeFileSync(webFaviconPath, faviconBuf);

        // 3. Electron Installer Icon (ICO Multi-size)
        // Re-read original for best quality downscaling
        const original = await Jimp.read(inputPath);
        const buildIcoPath = path.resolve('build/icon.ico');

        console.log('Updating Electron Installer Icon...');
        // Save a temp high-res png for conversion
        await original.write(buildPngPath);
        const installBuf = await pngToIco(buildPngPath);
        fs.writeFileSync(buildIcoPath, installBuf);

        console.log('Success! All icons (Web & Desktop) have been updated.');
        console.log('Next step: Update index.html to point to favicon.ico/png instead of svg if needed.');

    } catch (error) {
        console.error('Error updating icons:', error);
        process.exit(1);
    }
}

updateAllIcons();
