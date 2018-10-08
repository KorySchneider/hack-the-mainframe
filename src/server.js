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
  fs.readFile(__filename, 'utf-8', (err, serverCode) => {
    res.send(`
      <html>
        <title>THE MAINFRAME</title>
        <body>
          <p>Welcome. Here is the <span id='code'>code</span> you requested.</p>

          <textarea id='server-code'>
            ${escape(serverCode)}
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

        <style>body,button,html,textarea{background-color:#000;color:#0F0}body,html{font-family:monospace;text-align:center;padding:50px 0}textarea{width:700px;height:600px;margin:10px;padding:10px}button,textarea{border-color:#0F0;outline:0}::selection{background:#999}::-moz-selection{background:#999}::-webkit-scrollbar{display:none}</style>
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
