import { Jimp } from 'jimp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';

async function processUserIcon() {
    try {
        const inputPath = path.resolve('public/icons/new-logo.png');

        if (!fs.existsSync(inputPath)) {
            console.error('Error: Could not find "public/icons/new-logo.png". Please save the file there first.');
            process.exit(1);
        }

        console.log(`Reading image from ${inputPath}...`);
        const image = await Jimp.read(inputPath);

        // Resize to standard icon size
        image.resize({ w: 256, h: 256 });

        // Invert colors for Dark Mode (Black P on White -> White P on Black)
        // Checks if we should invert (simple heuristic or just force it as requested)
        console.log('Inverting colors for Dark Mode...');
        image.invert();

        // Optional: Make background transparent if it was white?
        // Simple invert makes white background -> black (0,0,0).
        // Let's keep it black for the "Dark Theme" look requested.

        const pngPath = path.resolve('build/icon.png');
        const icoPath = path.resolve('build/icon.ico');

        // Ensure build dir exists
        if (!fs.existsSync('build')) fs.mkdirSync('build');

        console.log(`Writing processed PNG to ${pngPath}...`);
        await image.write(pngPath);

        console.log('Generating ICO...');
        const buf = await pngToIco(pngPath);
        fs.writeFileSync(icoPath, buf);

        console.log('Success! New Dark Mode icons created in build/');
    } catch (error) {
        console.error('Error processing icon:', error);
        process.exit(1);
    }
}

processUserIcon().catch(console.error);
