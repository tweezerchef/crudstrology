// router
const express = require('express');
const External = express.Router();
const axios = require('axios');
const { config } = require('dotenv');
config();
const { Configuration, OpenAIApi } = require('openai');
// const readline = 'readline';
const configuration = new Configuration({
  organization: 'org-JR8ScrqlOZ2ISfjTgxxFSqu8',
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// const { External } = Router();

// auth
require('./auth.js');

// middleware
External.use(express.json());
External.use(express.urlencoded({ extended: true }));

// *****************************
// ***** EXTERNAL API HITS *****
// *****************************

// API
External.get('/quotes', (req, res) => {
  axios.get('https://api.quotable.io/random')
    .then(result => res.status(200).send(result.data))
    .catch(err => res.status(500).send(err));
});

External.get('/crystal-ball', async (req, res) => {
  //console.log('this is what the request body looks like for the openAI GET request: ', req.body);
  await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: req.query.content }],
  })
    .then(({ data }) => {
      // openAIResponse = data.choices[0].message;
      // console.log('this is the response from the then statement: ', data.choices[0].message);
      openai.createImage({
        prompt: data.choices[0].message.content
      })
        .then(({ data }) => {
          console.log('this is data for image generation: ', data);
          res.status(200).send(data.data[0].url);
        })
        .catch(err => {
          console.error('an error occurred with creating image: ', err);
          res.sendStatus(500);
        });
      // res.status(200).send(data.choices[0].message);
    })
    .catch(err => {
      console.error('an error occurred with the POST request to openai: ', err);
      res.sendStatus(500);
    });
});


// API
External.post('/horo', (req, res) => {
  // console.log('____SERVER____');
  // console.log('REQ BODY', req.body)
  const { user } = req.body;
  // console.log('USER DESTRUCTURED', user);
  axios.post(`https://aztro.sameerkumar.website?sign=${user.sign}&day=today`)
    .then(result => {
      // console.log('RESULT from Aztro API', result.data);
      result.data.sign = user.sign;
      res.status(200).send(result.data);
    })
    .catch(err => res.sendStatus(500)); // console.log('Error from Aztro api post request SERVER', err)
});

module.exports = { External };
