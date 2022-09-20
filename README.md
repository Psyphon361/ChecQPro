# **ChecQPro - Automated Cheque Processing and Fraud Detection**

**INTRODUCTION:** Through this project, We are aiming to automate the process of cheque processing. In order to perform the task of cheque verification, we developed
a tool which acquires the cheque leaflet key components, essential for the task of cheque clearance using image processing and deep learning methods. These components include the bank branch code, cheque number, legal as well as courtesy amount, cheque date, account number, and signature patterns. 

## Prerequisites:
    1. NodeJS should be installed on the system.
    2. MongoDB should be installed and the server should be running.
    3. An active internet connection.

## To run the project locally, follow these steps:
    1. Clone the repository: git clone https://github.com/Psyphon361/ChecQPro
    2. Change the directory: cd ChecQPro
    3. Initialise npm in the project directory: npm init -y
    4. Install the node modules: npm i
    5. Generate OAuth Client ID and Secret for Google and Twitter.
    6. Place the Client IDs and Secrets in a .env file in the root of the project.
    7. Create service account on Google Cloud Platform and enable Vision API service.
    8. Create private key for the service account in JSON format.
    9. Rename the JSON file to cheque_processing.json and place the file in the root of the project.
    10. Change the base URL of src/oauth/google.js and src/oauth/twitter.js OAuth files to http://127.0.0.1:5555/{google/twitter}/callback
    11. Run the server using: npm run dev
    12. Open this link in browser: http://127.0.0.1:5555/
   
## ChecQPro Flask Application:
  - This Node App uses the ChecQPro Flask API for extracting cheque leaflet key components. These components include the bank branch code, cheque number, legal as well as courtesy amount, account number, cheque date, and signature patterns.
  - The Flask API returns the authenticity of the cheque by checking the signature, cheque date and matching legal & courtesy amounts.
  - [Repository Link](https://github.com/ekarth/AutomatedChequeProcessing)
