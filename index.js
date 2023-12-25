const express = require('express');
const multer = require('multer');
const tesseract = require('node-tesseract-ocr');
const path = require('path');
const fs = require('fs/promises'); 

const app = express();

app.use(express.static(path.join(__dirname, '/uploads')));
app.set('view engine', 'ejs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder for uploaded files
  },
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.render('index', { extractedInfo: null, outputJSON: '' }); // Render the index view initially with empty extracted information and JSON
});

app.post('/extracttextfromimage', upload.single('file'), async (req, res) => {
  const config = {
    lang: 'eng', // Language for OCR processing
    oem: 1,
    psm: 3,
  };

  try {
    const text = await tesseract.recognize(req.file.path, config); // Perform OCR on the uploaded image

    // Extract specific information using regular expressions
    const extractedInfo = extractInformationFromOCR(text);

    // Convert the extracted info to JSON
    const outputJSON = JSON.stringify(extractedInfo, null, 2);

    // Write the JSON data to a file named output.json
    await fs.writeFile('uploads/output.json', outputJSON);

    // Render the extracted information and output JSON on the UI
    res.render('index', { extractedInfo, outputJSON });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Error extracting text');
  }
});

// Function to extract information from the OCR text using regular expressions
function extractInformationFromOCR(text) {
  const idNumberRegex = /identification Number (\d{1,} \d{1,} \d{1,} \d{1,} \d{1,})/i;
  const nameRegex = /Name ([\w\s]+)(?=\s*Lastname)/i;
  const lastNameRegex = /Lastname\s+([A-Za-z]+)/i;
  const dobRegex = /Date of Birth (\d{1,2} [A-Za-z]+\. \d{4})/i;
  const issueDateRegex = /Date of Issue (\d{1,2} [A-Za-z]+\. \d{4})/i;
  const expiryDateRegex = /Date of Expiry (\d{1,2} [A-Za-z]+\. \d{4})/i;
  

  // Match regex patterns in the OCR text
  const idNumberMatch = text.match(idNumberRegex);
  const nameMatch = text.match(nameRegex);
  const lastNameMatch = text.match(lastNameRegex);
  const dobMatch = text.match(dobRegex);
  const issueDateMatch = text.match(issueDateRegex);
  const expiryDateMatch = text.match(expiryDateRegex);

  // Construct extracted information object
  const extractedInfo = {
    idNumber: idNumberMatch ? idNumberMatch[1] : null,
    name: nameMatch ? nameMatch[1] : null,
    lastName: lastNameMatch ? lastNameMatch[1] : null,
    dateOfBirth: dobMatch ? dobMatch[1] : null,
    dateOfIssue: issueDateMatch ? issueDateMatch[1] : null,
    dateOfExpiry: expiryDateMatch ? expiryDateMatch[1] : null,
  };

  return extractedInfo;
}

app.listen(5000, () => {
  console.log('App is listening on port 5000');
});
