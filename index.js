const http = require('http');
const fs = require('fs');
const path = require('path');

const host = 'localhost';
const port = 8000;

const { Transform } = require('stream');

class CustomStream extends Transform {
    constructor() {
        super();
    }

    _transform(chunk, encoding, callback) {
        const input = chunk.toString();
        const output = input.replace(/[a-z]/g, char => char.toUpperCase());
        this.push(output);
        callback();
    }
}

const server = http.createServer((req, res) => {
    // Replace this code by your own

    const url = req.url;
    const method = req.method;

    //Cookie
    if (url === '/cookie') {
        const cookieHeader = req.headers.cookie;
        const cookies = {};

        if (cookieHeader) {
            cookieHeader.split(';').forEach(cookie => {
                const [name, value] = cookie.trim().split('=');
                cookies[name] = value;
            });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });

        if (cookies.user_info === 'user1') {
            const user = {
                id: 1,
                firstName: "Leanne",
                lastName: "Graham"
            };
            res.end(JSON.stringify(user));
        } else {
            res.end(JSON.stringify({}));
        }
    }
    //CSV to JSON
    else if (url === '/csv-to-json' && method === 'GET') {
        const filePath = path.join(__dirname, 'data.csv');

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Помилка при читанні файлу' }));
                return;
            }

            const lines = data.trim().split('\n');
            const headers = lines[0].split(',');
            const json = lines.slice(1).map(line => {
                const values = line.split(',');
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = values[index];
                });
                return obj;
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(json, null, 2));
        });
    }
    //Custom stream
    //Invoke-RestMethod -Uri "http://localhost:8000/customstr" -Method POST -Body "hello 123 world"
    else if (url === '/customstr' && req.method === 'POST') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        const customStream = new CustomStream();
        req.pipe(customStream).pipe(res);
    }
    else 
    {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Route not found');
    }
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});