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

const thisFile = __filename;
app.get('/', (req, res) => {
  fs.readFile(thisFile, 'utf-8', (err, contents) => {
    code = escape(contents);
    res.send(`
      <html>
        <title>THE MAINFRAME</title>

        <body>
          <p>Welcome. Here is the code you requested.</p>

          <textarea id='server-code'>
            ${code}
          </textarea><br><br>

          <button id='reload'><h3>HACK THE MAINFRAME</h3></button>
        </body>

        <script>
          window.onload = () => {
            let textarea = document.querySelector('#server-code');
            setTimeout(() => {
              textarea.value = unescape(textarea.value).trim()
            }, 250);

            // On button press: POST new server code, wait 3 sec, refresh page
            let btn = document.querySelector('#reload');
            btn.addEventListener('click', event => {
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
