import fs from 'fs';
import pdf from 'pdf-parse';

const file = process.argv[2];
const dataBuffer = fs.readFileSync(file);

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(e => {
    console.error("Error reading PDF:", e);
});
