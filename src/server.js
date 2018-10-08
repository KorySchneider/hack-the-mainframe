const express = require('express');
const app = express();
const fs = require('fs');
const shell = require('shelljs');

// Middleware to handle plaintext from POST
app.use((req, res, next) => {
  if (req.is('text/*')) {
    req.text = ''
    req.setEncoding('utf8');
    req.on('data', chunk => req.text += chunk);
    req.on('end', next);
  } else {
    next();
  }
});

// Serve the code
app.get('/', (req, res) => {
  fs.readFile(__filename, 'utf-8', (err, contents) => {
    res.send(`
    <html>
      <title>THE MAINFRAME</title>
      <body>
        <p>Welcome. Here is the code you requested.</p>

        <textarea id='server-code'>
          ${escape(contents)}
        </textarea><br><br>

        <button id='reload'>HACK THE MAINFRAME</button>
      </body>

      <script>
        window.onload = () => {
          let textarea = document.querySelector('#server-code');
          textarea.value = unescape(textarea.value).trim();
        }
        document.querySelector('#reload').addEventListener('click', event => {
          fetch('/', {
            method: 'POST',
            body: document.querySelector('#server-code').value,
            headers: {
              'Content-Type': 'text/plain'
            }
          }).then(setTimeout(() => location.reload() , 3000));
        });
      </script>

      <style>
        html, body {
          font-family: monospace;
          text-align: center;
        }
        textarea {
          width: 700px;
          height: 600px;
        }
      </style>
    </html>
    `);
  });
});

// Restart server with new code
app.post('/', (req, res) => {
  fs.writeFile(__filename, req.text, err => {
    if (err) throw err;
    shell.exec(`${__dirname}/restart.sh`);
    res.send('server code updated');
  });
});

app.listen(8080);
