const express = require('express');
const multer = require('multer');
const tesseract = require('node-tesseract-ocr');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

app.use(express.static(path.join(__dirname, '/uploads')));
app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://vivsn3:jzLWWIz6Wjj1t3wU@cluster0.jc2uj7q.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder for uploaded files
  },
});

const upload = multer({ storage: storage });

const ocrSchema = new mongoose.Schema({
  idNumber: String,
  name: String,
  lastName: String,
  dateOfBirth: String,
  dateOfIssue: String,
  dateOfExpiry: String,
});

const OCRModel = mongoose.model('OCRModel', ocrSchema);


app.get('/', (req, res) => {
  res.render('index', { extractedInfo: null, outputJSON: '' });
});

app.get('/printAllOCRData', async (req, res) => {
  try {
    const allRecords = await OCRModel.find({});
    res.json(allRecords);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error retrieving all OCR records' });
  }
});

app.post('/extracttextfromimage', upload.single('file'), async (req, res) => {
  const config = {
    lang: 'eng', // Language for OCR processing
    oem: 1,
    psm: 3,
  };

  try {
    const text = await tesseract.recognize(req.file.path, config);

    const extractedInfo = extractInformationFromOCR(text);

    const ocrData = new OCRModel(extractedInfo);
    await ocrData.save();

    res.render('index', { extractedInfo, outputJSON: JSON.stringify(extractedInfo, null, 2) });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Error extracting text');
  }
});

function extractInformationFromOCR(text) {
  const idNumberRegex = /identification Number (\d{1,} \d{1,} \d{1,} \d{1,} \d{1,})/i;
  const nameRegex = /Name ([\w\s]+)(?=\s*Lastname)/i;
  const lastNameRegex = /Lastname\s+([A-Za-z]+)/i;
  const dobRegex = /Date of Birth (\d{1,2} [A-Za-z]+\. \d{4})/i;
  const issueDateRegex = /Date of Issue (\d{1,2} [A-Za-z]+\. \d{4})/i;
  const expiryDateRegex = /Date of Expiry (\d{1,2} [A-Za-z]+\. \d{4})/i;

  const idNumberMatch = text.match(idNumberRegex);
  const nameMatch = text.match(nameRegex);
  const lastNameMatch = text.match(lastNameRegex);
  const dobMatch = text.match(dobRegex);
  const issueDateMatch = text.match(issueDateRegex);
  const expiryDateMatch = text.match(expiryDateRegex);

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

// Error handling for unhandled routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(5000, () => {
  console.log('App is listening on port 5000');
});
