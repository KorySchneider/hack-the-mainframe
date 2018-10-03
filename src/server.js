const express = require('express');
const app = express();
const fs = require('fs');
const shell = require('shelljs');

app.get('/', (req, res) => {
  fs.readFile(`${__filename}`, 'utf-8', (err, contents) => {

    res.send(`
    <html>
      <textarea name='server' autofocus>
        ${escape(contents)}
      </textarea>

      <br/>

      <button>Reload server</button>

      <script>
        window.onload = () => {
          let textarea = document.querySelector('textarea');
          textarea.value = unescape(textarea.value).trim();
        }
      </script>

      <style>
        html, body {
          font-family: monospace;
          text-align: center;
        }
        textarea {
          width: 700;
          height: 800;
        }
      </style>
    </html>
    `);

  });
});

app.post('/', (req, res) => {
  shell.exec(`./restart.sh`);
});

app.listen(8080);
