var codeMirrorInstance
var pad = document.getElementById('code');
var out = document.getElementById('output');
var ws = null;
var directoryAll

function addcode(textToInsert) {
    var cursor = codeMirrorInstance.getCursor();

    // Get the current line's content
    var lineContent = codeMirrorInstance.getLine(cursor.line);

    // Calculate the index where the text should be inserted
    var insertionIndex = codeMirrorInstance.indexFromPos(cursor);

    // Text to insert


    // Insert the text at the current cursor position
    codeMirrorInstance.replaceRange(textToInsert, cursor, cursor);
    // Get the leading whitespace of the current line
    var lineLeadingWhitespace = /^\s*/.exec(codeMirrorInstance.getLine(cursor.line))[0];

    // Insert a new line with the same leading whitespace
    codeMirrorInstance.replaceRange('\n' + lineLeadingWhitespace, cursor, cursor);
}
async function fetchTargets() {
    try {
        const response = await fetch('/api/targets'); // Replace with your API endpoint
        const targets = await response.json();

        // Get the target select element
        const targetSelect = document.getElementById('target');

        // Clear existing options
        targetSelect.innerHTML = '';

        // Add options dynamically based on the API response
        targets.forEach(target => {
            const option = document.createElement('option');
            option.value = target.value;
            option.text = target.text;

            // Set the default option if specified
            if (target.default) {
                option.defaultSelected = true;
            }

            targetSelect.add(option);
        });

    } catch (error) {
        console.error('Error fetching targets:', error);
    }
}
async function fetchLessons() {
    try {
        const response = await fetch('/api/lessons');
        const data = await response.json();

        // Get the lesson select element
        const lessonSelect = document.getElementById('lesson');

        // Clear existing options
        lessonSelect.innerHTML = '';

        // Add a default option
        const defaultOption = document.createElement('option');
        defaultOption.value = 'default';
        defaultOption.text = '----';
        lessonSelect.add(defaultOption);
        directoryAll = data
        // Add options dynamically based on the API response    
        data.directories.forEach(directory => {
            const option = document.createElement('option');
            option.value = directory.directory;
            option.text = directory.directory;
            lessonSelect.add(option);

        });

    } catch (error) {
        console.error('Error fetching lessons:', error);
    }
}

function getParameterByName(name) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
function updatelesson(fileName) {
    document.getElementsByTagName('md-block')[0].src = './lessons/' + fileName + '/tnotes.md'
    document.getElementsByTagName('md-block')[1].src = './lessons/' + fileName + '/notes.md'
    const button = document.createElement('button');
    button.innerHTML = "Your Code"
    button.classList.add("tablinks")
    button.onclick = (event) => openTab(event, 'tab1')
    const bar = document.getElementById('tab-bar')
    bar.innerHTML = ''
    bar.appendChild(button);

    directoryAll.directories.find(el => el.directory == fileName).files.forEach(file => {
        const button = document.createElement('button');
        button.innerHTML = file
        button.classList.add("tablinks")
        button.onclick = (event) => openTab(event, file)
        bar.appendChild(button);

        const dev = document.createElement('dev');
        const md = document.createElement('md-block');
        loadpy(md, fileName, file)
        dev.appendChild(md)
        dev.classList.add("tab-content")
        dev.id = file
        const tabs = document.getElementById('tabs')
        tabs.appendChild(dev)
    })
    loadstart(fileName)
}
async function loadpy(dom, fileName, file) {

    const data = await fetch('./lessons/' + fileName + '/' + file)
    const text = await data.text()

    dom.mdContent = "```python\n" + text + "\n```"

}
function connect() {
    var addr = document.getElementById('target').value
    out.innerText += `connecting to ${addr} \n`
    if (ws) ws.close();
    var m = addr.match(/(\d+\.\d+\.\d+\.\d+)(:(\d+))?/);
    if (m) addr = "ws://" + m[1] + ":" + (m[3] || 8266) + "/";
    try {
        ws = new WebSocket(addr);
    } catch (error) {
        out.innerHTML += "failed to connect\n"
    }
    ws.binaryType = 'arraybuffer';
    ws.onclose = function (ev) {
        out.innerText += "Closed with status " + ev.code + "\n";
    }
    ws.onopen = function () {
        ws.onmessage = function (ev) {
            if (ev.data.endsWith('Password: ')) {
                console.log("sending password");
                ws.send('g1VEEOQX' + "\r");
            } else if (ev.data.match(/Access denied/)) {
                out.innerText += "Access denied\n";
            } else {
                out.innerText += ev.data
            }
        }
    }
}
function stopCode() {
    ws.send(' \x03');
}
function runCode() {

    var status = 0;


    console.log('executing');
    ws.onmessage = function (ev) {
        for (var i = 0; i < ev.data.length; i++) {
            var c = ev.data[i];
            if (status == 0 && c == 'O') { status = 1 }
            if (status == 1 && c == 'K') { status = 2 }
            // else if (status == 2 && c == '\x04') { status = 3; out.innerText = '' }
            else if (status == 2 && c != '\r') { out.innerText += c }
            else if (status == 3 && c == '\x04') { status = 4 }
            else if (status == 3 && c != '\r') { out.innerText += c }
        }
    }

    ws.send('\x01_g=globals().copy();_g.pop("_g", None);');


    function sendpads() {
        var pad = document.getElementById('code');

        var code = codeMirrorInstance.getValue();
        code = 'forever = True \n' + code

        var wrap = 'exec("""' + code + '\n""", _g)\x04';
        function sendcode() {
            ws.send(wrap.substr(0, 20));
            wrap = wrap.substr(20);
            if (wrap) setTimeout(sendcode, 50);
        }
        sendcode();
    }
    sendpads();
}
function setCode() {
    var codeInput = document.getElementById("codeInput").value;
    codeMirrorInstance.setValue(codeInput);
}
function loadstart(fileName) {
    if (fileName) {
        fetch('./lessons/' + fileName + '/start.py')
            .then(response => {
                if (!response.ok) throw new Error()
                return response.text()
            })
            .then(start => {
                codeMirrorInstance.setValue(start);
                var cursor = codeMirrorInstance.getSearchCursor('#>');

                // Find the first occurrence of the target string
                if (cursor.find()) {
                    var start = cursor.from();
                    var end = cursor.to();

                    // Remove the text by replacing it with an empty string
                    codeMirrorInstance.replaceRange("", start, end);

                    // (Optional) Set the cursor to the end of the removed text
                    codeMirrorInstance.setCursor(start);
                } else {
                    console.log("String not found");
                }

            })
            .catch(error => {
                console.error('Error fetching start file:', error);
            });
    } else {
        console.error('No file name specified in the URL');
    }
    if (fileName) {
        fetch('./lessons/' + fileName + '/functions.json')
            .then(response => {
                if (!response.ok) throw new Error()
                return response.json()
            })
            .then(functionsArray => {
                var container = document.getElementById("function-names");
                container.innerHTML = ''
                functionsArray.forEach(function (func) {
                    var button = document.createElement("button");
                    button.textContent = func.name;
                    button.classList.add(`code-${func.type}`)
                    button.onclick = function () {
                        addcode(func.code);
                    };

                    container.appendChild(button);
                });

            })
            .catch(error => {
                console.error('Error fetching start file:', error);
            });
    } else {
        console.error('No file name specified in the URL');
    }
}
function toggleLeftPane() {
    const left = document.getElementById('left-pane');

    left.style.display = (left.style.display === 'none' || left.style.display === '') ? 'block' : 'none';
}
function toggleRightPane() {
    const right = document.getElementById('right-pane');

    right.style.display = (right.style.display === 'none' || right.style.display === '') ? 'block' : 'none';
}
function toggleMidPane() {
    const mid = document.getElementById('mid-pane');

    mid.style.display = (mid.style.display === 'none' || mid.style.display === '') ? 'block' : 'none';
}
document.addEventListener('keydown', function (event) {
    // Check if Ctrl key and 'T' key are pressed
    if (event.altKey && event.key === 't') {
        // Prevent the default behavior of the key combination (e.g., opening a new tab)
        event.preventDefault();

        // Run the toggleMidPane function
        toggleLeftPane();
    }
});


function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active-tab");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active-tab");
}

// Set the default tab (e.g., Tab 1) as active
document.getElementById("tab1").style.display = "block";

window.onload = function () {
    fetchLessons();
    fetchTargets();
    codeMirrorInstance = CodeMirror.fromTextArea(document.getElementById('code'), {
        mode: 'python', // Set the mode for syntax highlighting (change this to your desired language)
        lineNumbers: true, // Show line numbers
        theme: 'abcdef'// Set the theme (change this to your desired theme)
    });
    loadstart()
    connect()
}