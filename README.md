# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Users Homepage when logged in"](https://github.com/KirstenHammond/tiny_app/blob/main/docs/TinyApp_Login.png?raw=true)
!["Creating a New TinyURL"](https://github.com/KirstenHammond/tiny_app/blob/main/docs/TinyApp_newtinyURL.png?raw=true)
!["Editing an existing TinyURL"](https://github.com/KirstenHammond/tiny_app/blob/main/docs/TinyApp_editURL.png?raw=true)
!["Logging in"](https://github.com/KirstenHammond/tiny_app/blob/main/docs/TinyApp_Login.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs for password encryption
- cookie-session for encryption
- method-override using `app.delete` and `app.put`

### Helpful extras
- Mocha/Chai for unit testing
- nodemon for automatic server restarts

### Contents
1. [Mocha/Chai Unit Testing](/test)
2. [View pages for EJS rendering](/views)
  
3. [Databases for URLs and Users](/database.js)
4. [Express Server aka where the magic happens](/express_server.js)
5. [Helper functions](/helperFunctions.js)


### Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

#### Acknowledgements
This project was completed in 4 days during the @lighthouselabs Web Development Bootcamp.

