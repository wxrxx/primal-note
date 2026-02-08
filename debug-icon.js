import fs from 'fs';
try {
    const buf = fs.readFileSync('public/icons/icon.png');
    console.log('Size:', buf.length);
    console.log('Header:', buf.slice(0, 8).toString('hex'));
} catch (e) {
    console.error(e);
}
