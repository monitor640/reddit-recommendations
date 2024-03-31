const OpenAI = require('openai');
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors')
const natural = require('natural');
const pos = require('pos')
const app = express();
const { removeStopwords } = require('stopword')
const path = require("path");
require('dotenv').config();

app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5006;
app.options('/api/search', cors());

app.use(express.static(path.join(__dirname, '../../build')));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.post('/api/search', async (req, res) => {
    const { searchTerm } = req.body;
    try {
        const comments = await topFiveLinks(searchTerm);
        let preprocessedComments = preprocessComments(comments);
        let positiveComments = findPositiveComments(preprocessedComments);
        let productCounts = await findProductsFromComments(positiveComments);
        console.log("Returning product counts")
        res.setHeader('Content-Type', 'application/json');
        res.send(productCounts);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


async function topFiveLinks(searchTerm) {
    let allComments = [];
    try {
        const key = process.env.GOOGLE_API_KEY;
        console.log('Key:', key)
        const link = 'https://www.googleapis.com/customsearch/v1?key=' + key + "&cx=27ca424020c1248b9&num=5&q=" + searchTerm;
        const response = await fetch(link);
        const data = await response.json();

        const items = data.items;
        if (items) {
            const promises = items.map(item => getAllCommentsForPost(item.link));
            const commentsArrays = await Promise.all(promises);
            commentsArrays.forEach(comments => allComments.push(...comments));
            return allComments;
        } else {
            console.error('Items is undefined');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function getAllCommentsForPost(link) {
    try {
        const response = await fetch(link + "article.json");
        const data = await response.json();

        const comments = data[1];
        const comment_data = comments.data.children;

        let all_post_comments = [];
        comment_data.forEach(comment => {
            all_post_comments.push(...traverseChildren(comment.data));
        });

        return all_post_comments;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
}

function traverseChildren(children) {
    let commentBody = [];
    commentBody.push(children.body);
    if (children.replies && children.replies.data && children.replies.data.children) {
        children.replies.data.children.forEach(reply => {
            commentBody.push(...traverseChildren(reply.data));
        });
    }
    return commentBody;
}

//preprocess the comments
function preprocessComments(comments) {
    let preprocessedComments = [];
    comments.forEach(comment => {
        if (comment === null || comment === undefined) {
            return;
        }
        let words = comment.split(" ");
        //filter stopwords, links, newlines and deleted/removed comments
        words = removeStopwords(words);
        words = words.filter(word => !word.includes("http"));
        words = words.filter(word => !word.includes("\n"));
        words = words.filter(word => !word.includes("[deleted]"));
        words = words.filter(word => !word.includes("[removed]"));
        //join the words back together
        words = words.join(" ");
        if (words.length < 1 ) {
            return;
        }
        preprocessedComments.push(words);
    });
    return preprocessedComments;
}

function findPositiveComments(comments) {
    let sentiment = natural.SentimentAnalyzer;
    let stemmer = natural.PorterStemmer;
    let positiveComments = [];
    let analyzer = new sentiment("English", stemmer, "afinn");

    comments.forEach(comment => {
        let words = comment.split(" ");
        let result = analyzer.getSentiment(words);
        if (result > 0) {
            positiveComments.push(comment);
        }
    });
    return positiveComments;
}

async function findProductsFromComments(comments) {
    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY,});
    let commentsAsString = comments.join("\n");
    try {
        const gptResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in findinng brands from a list of comments. Your task is to return all brands you find."
                },
                {
                    role: "user",
                    content: commentsAsString
                }
            ],
            temperature: 0,
            top_p: 1,

        });
        console.log(gptResponse.choices[0].message.content);
        let response = gptResponse.choices[0].message.content;
        let products = response.split("\n");
        products = products.map(product => product.split(' ').slice(1).join(' '));
        //remove identical products
        products = [...new Set(products)];
        //check that products are not empty
        products = products.filter(product => product.length > 0);
        console.log(products);
        return countProductOccurences(comments, products);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function countProductOccurences(comments, products){
    let productCount = {};
    comments.forEach(comment => {
        products.forEach(product => {
            if(comment.includes(product)){
                if(productCount[product]){
                    productCount[product]++;
                } else {
                    productCount[product] = 1;
                }
            }
        });
    });
    //sort the products by count
    productCount = Object.fromEntries(Object.entries(productCount).sort(([,a],[,b]) => b-a));
    console.log(productCount);
    return productCount;
}

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
