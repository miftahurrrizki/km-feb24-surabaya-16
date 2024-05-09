const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
   
    res.setHeader('Access-Control-Allow-Origin', '*');

  
    if (req.method === 'GET' && req.url === '/data') {
        const filePath = path.join(__dirname, 'data', 'Superstore.json');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
                return;
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(data);
        });
    } else {
       
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
