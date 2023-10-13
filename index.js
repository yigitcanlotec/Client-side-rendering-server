const express = require('express');
const { Pool } = require('pg');
const { jwt,base64UrlDecode, base64url, toUTF8 } = require('./jwt.js');
const { createHmac } = require('node:crypto');

const PORT = 3000;

const app = express();
app.use(express.json());

function argumentString(argument, startIndex) {
    const [ps, ...args] = process.argv;
    if (
        typeof argument &&
        args.find((element) => element.includes(argument)) !== undefined
    ) {
        return args
            .find((element) => element.includes(argument))
            .substring(startIndex);
    } else {
        return undefined;
    }
}

const pool = new Pool({
    user: argumentString('--user=', 7) || 'postgres',
    host: argumentString('--host=', 7) || 'localhost',
    database: argumentString('--database=', 11) || 'client_side_db',
    password: argumentString('--password=', 11) || 'test1234',
    port: argumentString('--port=', 7) || 5432,
});

const isUserAuthenticated = (token) => {};

// CORS function. Using as higher order function or middleware.
const CORS = (req, res, next) => {
    //CORS Header
    const allowedOrigins = ['*'];
    const origin = req.headers.origin;
    // if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    //     res.setHeader('Access-Control-Allow-Origin', origin);
    // }
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', true);
    // res.header('Access-Control-Max-Age', 86400);
    next();
};



  




// app.use(CORS);

// CORS option for preflight request.
app.options('/', CORS, (req, res, next) => {
    res.sendStatus(200);
});

// CORS option for actual request.
app.post('/', CORS, (req, res, next) => {
    // console.log(req.body);
    const queryString = 'SELECT * FROM users WHERE username = $1';
    pool.query(queryString, [req.body.username], (error, result) => {
        if (error) {
          res.sendStatus(418); // Instead of 503
        } else {
            // console.log('Query result:', result.rows);
           
              if (result.rowCount === 1 
                && result.rows[0].username === req.body.username
                && result.rows[0].password === req.body.password){
                
                // Get the current date and time
                const currentDate = new Date();

                // Add 15 minutes (15 minutes * 60 seconds * 1000 milliseconds)
                const fifteenMinutesLater = new Date(currentDate.getTime() + 15 * 60 * 1000);
                const token = jwt(req.body.username, fifteenMinutesLater);
                // console.log(token);
                // res.status(200).send(token);
                // const URL = `/?client_identifier=${req.body.username}&redirect_uri=${'test'}`;

               
                res.redirect(302, `http://localhost:3000/?client_identifier=${base64url(req.body.username)}&redirect_uri=${base64url('redirect_uri')}&token=${token}`);
               
          }else{
            res.sendStatus(401);
          }
        }
    });
  
});

app.get('/', CORS, (req,res) => {
    // console.log(req.query);
    const parsedToken = req.query.token.split('.');
    const tokenDate = new Date(JSON.parse(base64UrlDecode(parsedToken[1])).exp);
    const dateNow = new Date();
    
    if (tokenDate < dateNow) {
        res.sendStatus(401);
      } else {

        const hmac = createHmac('sha256', 'a secret');
        const signatureSets = base64UrlDecode(parsedToken[0]) + JSON.stringify('.') + base64UrlDecode(parsedToken[1]);
        const verifySignature = hmac.update(signatureSets).digest('base64url');
        hmac.end();

        if (parsedToken[2] === verifySignature){
            console.log('test ok');
            // res.redirect(`/${base64url(req.body.username)}`)
            res.redirect('http://localhost:5500');
        }
      }
    // res.sendStatus(200);
});




//----------------------------------------
app.get('/home', async (req, res) => {
    const databaseQueryString = 'SELECT * FROM tasks;';
    pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });

    const client = await pool.connect();
    const queryResponse = await client.query(databaseQueryString);

    // console.log(queryResponse.rows[0]);

    client.release();

    res.send(queryResponse);
});

app.post('/login', async (req, res) => {
    console.log('Request has been made.');
});

app.listen(PORT, (req, res) => {
    console.log(`The server started on port:${PORT}`);
});
