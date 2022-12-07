# DnD-Character-Sheet-WebApp
A website designed to allow users to create 5th edition characters using a custom character sheet, with access to it from anywhere.

## Getting started with development
This is a node.js webapp, and uses MongoDB as its database for storing information. As such, please install the following locally:
1. Node.js
2. MongoDB

After installing Node.js and MongoDB, you're ready to get set up!
1. Navigate to the directory you cloned this repository to.
2. Open a shell and run 'npm i'. This will download all the dependent packages used in the project.
3. Open the template '.env' file in the root directory and fill out the SESSION_SECRET variable with quotes.
4. You're set! Just run 'npm start' from the root directory and it will start up the webserver on your local machine. The default port is 8080, and can be accessed in a browser via http://localhost:8080

## Recommended applications and stuff
MongoDB has the option to install with an application called MongoDBCompass. I **highly** recommend using this, as it makes it easy to look through the database itself and troubleshoot directly.
VSCode is an extremely versatile IDE and I will always recommend it, especially for web development.
  On that note, this project uses .ejs files to create dynamic views. I **strongly** recommend getting the 'EJS language support' extension, as EJS tags will not be properly detected with the default linter.
