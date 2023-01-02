const {app, BrowserWindow} = require('electron')
const Store = require('electron-store');
const store = new Store();
const {ipcMain} = require('electron')
const fs = require("fs");
const path = require("path");

function createWindow() {
    if (store.get('width') === undefined) {
        store.set('width', '800');
    }
    if (store.get('height') === undefined) {
        store.set('height', '600');
    }
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        width: store.get('width'),
        height: store.get('height'),
    })
    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
    console.log(store.get('width'));
    ipcMain.on('asynchronous-message', (event, arg) => {
        let word = arg[0];
        let number = arg[1];
        fs.readdir('old_images', (err, files) => {
            if (err) throw err;

            for (const file of files) {
                number++;
                fs.rename('old_images/' + file, 'new_images/'+ word + '00000' + number +'.jpg', function (err) {
                    if (err) throw err;
                    console.log('File Renamed.');
                });
                console.log(file);
            }
        });
        event.sender.send('asynchronous-reply', 'hello' );
    });

    ipcMain.on('clear-new', (event, arg) => {
        fs.readdir('new_images', (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join('new_images', file), (err) => {
                    if (err) throw err;
                });
            }
        });
    });

    ipcMain.on('clear-old', (event, arg) => {
        fs.readdir('old_images', (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join('old_images', file), (err) => {
                    if (err) throw err;
                });
            }
        });
    });
})

app.on('window-all-closed', () => {
    if (store.get('settings.quitStyle') === 'force') {
        app.quit()
    } else {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    }
})