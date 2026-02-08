import { Resvg } from '@resvg/resvg-js';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
    try {
        const svgPath = path.resolve('public/icons/logo.svg');
        const pngPath = path.resolve('build/icon.png');
        const icoPath = path.resolve('build/icon.ico');

        console.log('Reading SVG...');
        const svg = fs.readFileSync(svgPath);

        console.log('Rendering SVG to PNG...');
        const resvg = new Resvg(svg, {
            fitTo: { mode: 'width', value: 512 },
        });
        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();

        // Ensure build dir exists
        if (!fs.existsSync('build')) fs.mkdirSync('build');

        console.log(`Writing PNG to ${pngPath}...`);
        fs.writeFileSync(pngPath, pngBuffer);

        console.log('Generating ICO from PNG...');
        // Resizing for ICO (usually needs smaller sizes, pngToIco handles multi-size)
        // We might want to pass a buffer or path. pngToIco takes file path or buffer?
        // documentation says: pngToIco(file) where file is array of paths.
        // Wait, standard usage is pngToIco(['file.png']);

        // Let's rely on file path since we just wrote it.
        const icoBuf = await pngToIco([pngPath]);
        fs.writeFileSync(icoPath, icoBuf);

        console.log('Success! Generated icon.png and icon.ico from SVG.');
    } catch (err) {
        console.error('Error generating icons:', err);
        process.exit(1);
    }
}

generateIcons();
