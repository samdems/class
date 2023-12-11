const express = require('express');
const http = require('http');
const path = require('path');
const fs = require("fs")
const app = express();
const server = http.createServer(app);


app.use(express.static(path.join(__dirname, 'public')));
app.use('/lessons/', express.static(path.join(__dirname, 'lessons')));

app.get('/api/targets', (req, res) => {
    const targetsFilePath = path.join(__dirname, 'targets.json'); // Replace with the actual path to your JSON file

    fs.readFile(targetsFilePath, 'utf-8', (err, targetsData) => {
        if (err) {
            console.error('Error reading targets file:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        try {
            const targets = JSON.parse(targetsData);
            res.json(targets);
        } catch (parseError) {
            console.error('Error parsing targets data:', parseError);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

app.get('/api/lessons', (req, res) => {
    const lessonsPath = path.join(__dirname, 'lessons');

    // Read the contents of the lessons directory
    fs.readdir(lessonsPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // Filter out only directories
        const directories = files.filter(file => file.isDirectory()).map(directory => {
            const subDirPath = path.join(lessonsPath, directory.name);
            const subFiles = fs.readdirSync(subDirPath).filter(subFile => subFile.endsWith('.py'));

            // Add the files starting with ".py" inside the subdirectory
            return {
                directory: directory.name,
                files: subFiles,
            };
        });

        // Send the list of directories and their ".py" files in the response
        res.json({ directories });
    });
});



// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`WebSocket server listening on http://localhost:${PORT}`);
});
