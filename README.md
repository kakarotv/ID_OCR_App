# ID OCR App

This application is an OCR (Optical Character Recognition) web app that extracts specific information such as identification number, name, last name, date of birth, date of issue, and date of expiry from an uploaded image of an identification document.

## Features

- **Image Upload**: Allows users to upload an image of an identification document.
- **OCR Processing**: Utilizes OCR technology to extract text from the uploaded image.
- **Information Extraction**: Parses the extracted text to identify and display specific information such as identification number, name, last name, date of birth, date of issue, and date of expiry.
- **Output JSON**: Provides the extracted information in JSON format.
- **Display All Entries**: Enables users to view all stored entries of OCR data.

## Technologies Used

- Node.js
- Express.js
- Multer (for handling file uploads)
- Tesseract.js (for OCR processing) (can download latest installer from: https://github.com/UB-Mannheim/tesseract/wiki)
- HTML/CSS for front-end layout
- MongoDB (for data storage)

## MongoDB Integration

This application integrates with MongoDB, a document-based NoSQL database, to store and manage the extracted information. The MongoDB database stores the following information:

- idNumber
- name
- lastName
- dateOfBirth
- dateOfIssue
- dateOfExpiry

## Steps to Run the ID OCR App

### Prerequisites:
- Node.js installed on your machine 
- Tesseract.js for OCR processing ([Tesseract.js Installer](https://github.com/UB-Mannheim/tesseract/wiki))
  
1. **Clone the repository**
2. **Install Dependencies like express, multer, node-tesseract-ocr(Ensure Tesseract is installed and the executable path is correctly set on your system), mongoose**
3. **Run the app:** run index.js file or write "node .\index.js" in terminal
4. **Access the App:** Open a web browser and go to "http://localhost:5000".
5. **Upload an Image**
   
