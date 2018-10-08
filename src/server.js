const express = require('express');
const fs = require('fs');
const shell = require('shelljs');

const app = express();

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

app.get('/', (req, res) => {
  fs.readFile(__filename, 'utf-8', (err, contents) => {
    res.send(`
    <html>
      <title>THE MAINFRAME</title>
      <body>
        <p>Welcome. Here is the <span id='code'>code</span> you requested.</p>

        <textarea id='server-code'>
          ${escape(contents)}
        </textarea><br><br>

        <button id='reload'><h3>HACK THE MAINFRAME</h3></button>
      </body>

      <script>
        window.onload = () => {
          let textarea = document.querySelector('#server-code');
          textarea.value = unescape(textarea.value).trim();

          document.querySelector('#reload').addEventListener('click', event => {
            fetch('/', {
              method: 'POST',
              body: document.querySelector('#server-code').value,
              headers: {
                'Content-Type': 'text/plain'
              }
            }).then(setTimeout(() => location.reload() , 3000));
          });
        }
      </script>

      <style>
        html, body {
          font-family: monospace;
          text-align: center;
          padding: 50px 0;
          background-color: #000;
          color: #00FF00;
        }
        textarea {
          width: 700px;
          height: 600px;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        button, textarea {
          background-color: #000;
          color: #00FF00;
          border-color: #00FF00;
          outline: none;
        }
      </style>
    </html>
    `);
  });
});

app.post('/', (req, res) => {
  fs.writeFile(__filename, req.text, err => {
    if (err) throw err;
    shell.exec(`${__dirname}/restart.sh`);
    res.send('server code updated');
  });
});

app.listen(8080);
