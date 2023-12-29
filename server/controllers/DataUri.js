const DataUriParser = require('datauri/parser');
const path = require("path")
const getData = (file) => {
    const parser = new DataUriParser();
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer);

}
module.exports = getData;