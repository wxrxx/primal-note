import { Jimp } from 'jimp';
import path from 'path';

async function updatePwaIcon() {
    try {
        const inputPath = path.resolve('public/icons/final-logo.png');
        const outputPath = path.resolve('public/icons/icon-192.png');
        console.log('Updating PWA Icon (192x192)...');
        const image = await Jimp.read(inputPath);
        image.resize({ w: 192, h: 192 });
        await image.write(outputPath);
        console.log('Success.');
    } catch (e) {
        console.error(e);
    }
}
updatePwaIcon();
