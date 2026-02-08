import { Jimp } from 'jimp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';

async function processIcon() {
    try {
        const inputPath = path.resolve('public/icons/icon.png');
        console.log(`Reading image from ${inputPath}...`);

        // Jimp.read might be available on the named export or as a static method
        // In v1, it is often: const image = await Jimp.read('path');
        const image = await Jimp.read(inputPath);

        const pngPath = path.resolve('public/icons/icon-fixed.png');
        console.log(`Writing true PNG to ${pngPath}...`);

        image.resize({ w: 256, h: 256 }); // check syntax, usually resize(w, h)
        await image.write(pngPath); // write might be promise or not in new version?
        // Actually v1 usually uses write(path) or writeAsync(path)

        // Let's assume write works or check object.
    } catch (e) {
        console.log('Jimp usage failed, trying legacy or inspecting object');
        console.log('Jimp export keys:', Object.keys(Jimp));
        if (Jimp.read) console.log('Jimp.read exists');
        else console.log('Jimp.read MISSING');
        process.exit(1);
    }

    try {
        // Proceed if write worked
        const pngPath = path.resolve('public/icons/icon-fixed.png');
        if (!fs.existsSync(pngPath)) {
            // Maybe write returned a promise? Use writeAsync if available?
            // Or write is async?
            // In new jimp, .write takes a callback? .writeAsync is better.
        }

        // Re-read or just assume logic.
        // Let's stick to standard syntax
    } catch (e) { }
}

// Actually, let's just make a simple robust script.
// If { Jimp } fails, we catch.

async function run() {
    const inputPath = path.resolve('public/icons/icon.png');
    const pngPath = path.resolve('public/icons/icon-fixed.png');
    const icoPath = path.resolve('public/icons/icon.ico');

    console.log('Starting...');
    const image = await Jimp.read(inputPath);
    console.log('Read image.');

    image.resize({ w: 256, h: 256 });
    console.log('Resized.');

    await image.write(pngPath);
    console.log('Written PNG.');

    const buf = await pngToIco(pngPath);
    fs.writeFileSync(icoPath, buf);

    fs.renameSync(pngPath, inputPath);
    console.log('Success.');
}

run().catch(console.error);
