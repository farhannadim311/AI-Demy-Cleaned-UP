# **AIDemy - YouTube Learning Assistant**

AIDemy is a Chrome Extension that summarizes YouTube videos into key points and generates quizzes to help users reinforce their understanding. It also includes multilingual support for summaries and quizzes.

---

## **How to Run the Project**

Follow these steps to install, configure, and run the project:

### **Prerequisites**
- Node.js (Download it [here](https://nodejs.org/))
- npm (Comes with Node.js)
- Chrome Canary Browser (https://www.google.com/chrome/canary/)
- A valid API key for the **Gemini API** (https://ai.google.dev/gemini-api/docs/api-key)

---

### **Step 1: Clone the Repository**
1. Open your terminal or command prompt.
2. Clone the repository:
   ```bash
   git clone https://github.com/your-username/AI-Demy-Cleaned-UP.git
3. Navigate to the repository
   ```bash
   cd AI-Demy-Cleaned-UP
### **Step 2: Install Dependencies**
1. Install Gemini API on your computer
    ```bash
    npm install @google/generative-ai
2. Install youtube-transcript-API
    ```bash
     npm i youtube-transcript
3. Install Webpack Config
   ```bash
   npm install webpack
   npm install webpack-cli
4. Install babel loader
   ```bash
   npm install babel-loader
   npm install @babel/preset-env
### **Step 3: Setup your API Key**
1. Add your API key to contentScript.js
2. Verify that your manifest.json includes paths to contentScript.js, popup.js, and background.js (or the bundled dist/bundle.js).
### **Step 4: Bundle the Project**
1. ```bash
   npx webpack
### **Step 5: Load Extension into Chrome**
1. Open Chrome and navigate to chrome://extensions/.
2. Enable Developer Mode in the top-right corner.
3. Click on Load unpacked.
4. Select the project directory
### **Step 6: Run the Extension**
1. Open a YouTube video.
2. Click on the AIDemy icon in the Chrome toolbar.
3. Use the Summary or Quizify features by clicking the respective buttons.
4. Select a language from the dropdown if you wish to use the multilingual feature.



  
