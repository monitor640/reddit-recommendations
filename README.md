# React App to find product recommendations 

This project helps users find product recommendations from reddit to avoid google searches that are filled with SEO ridden and sponsored blog posts.

## How to run the project

1. Clone the repository
2. Run `npm install` to install the dependencies
3. Create a `config.env` file in the root directory and add the following variables:
```
GOOGLE_API_KEY=<YOUR_GOOGLE_API_KEY>
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
```
4. Run `npm start` to start the development server
5. Open `http://localhost:3000` to view the app in the browser
6. Run `node --env-file='./config.env' ./src/backend/server.js` to start the backend server
