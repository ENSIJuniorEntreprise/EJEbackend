# Backend-EJE
backend for the EJE website

# Getting Started
Follow these instructions to get the project up and running on your local machine for development and testing purposes.

# Prerequisites
Before you begin, ensure you have the following installed on your system:

Node.js - JavaScript runtime

npm or Yarn - Package managers for Node.js
# Installation
## run the following command:

```bash
npm install
```
or

```bash
yarn install
```

## Set up environment variables:

Create a .env file and set values

    * PORT=  /* port to run the server on */
    * DB_URL= /* MongoDB URL */
    * EMAIL= /* gmail address */
    * PASSWORD=/* google app password*/
    * ACCESS_TOKEN_SECRET= 
    * REFRESH_TOKEN_SECRET=

To get the google app password, follow the instructions provided in the following link:

https://support.google.com/accounts/answer/185833?hl=en&sjid=6309740189120013856-EU

# Running the Server
## Start the server using the following command:

```bash
npm start
```
or

```bash
yarn start
```

The server will run on port 3000 by default. You can modify the port in the .env file if needed.

# API Documentation
## The server provides the following endpoints:

GET /article: Retrieve a list of articles.

GET /article/{substring}: Retrieve specific articles that include the substring in either the title or the description.

POST /article: Create a new article.

PUT /article/{id}: Update an existing article.

DELETE /article/{id}: Delete an article.

POST /subscriber: Add a subscriber to the newsletter.

DELETE /subscriber/{id}: Delete a newsletter subscriber.

POST /send-emails: Send newsletter to subscribers.


For more details on how to interact with the API endpoints, refer to the codebase.