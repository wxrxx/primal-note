import fs from 'fs';
import pngToIco from 'png-to-ico';
import path from 'path';

const inputPath = path.resolve('public/icons/icon.png');
const outputPath = path.resolve('public/icons/icon.ico');

console.log(`Converting ${inputPath} to ${outputPath}`);

pngToIco(inputPath)
    .then(buf => {
        fs.writeFileSync(outputPath, buf);
        console.log('Conversion successful');
    })
    .catch(err => {
        console.error('Conversion failed:', err);
        process.exit(1);
    });
