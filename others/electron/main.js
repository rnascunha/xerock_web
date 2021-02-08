const { app, BrowserWindow } = require('electron')

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#ff0000', 
        icon: './icon-512x512.png',
        webPreferences: {
//            nodeIntegration: true,
            nativeWindowOpen: true,
            enableBlinkFeatures: 'Serial'
        }
    })

//    win.webContents.session.on('select-serial-port', (event, portList, callback) => {
//        event.preventDefault();
//        console.log('event', event);
//        console.log(portList)
//    })
//   
//    win.webContents.session.on('select-serial-port', (event, portList, callback) => {
//        event.preventDefault()
//        console.log('port', event, portList);
//        const selectedPort = portList.find((device) => {
//            return device.vendorId === 0x2341 && device.productId === 0x0043
//        })
//        if (!selectedPort) {
//            callback('')
//        } else {
//            callback(result1.portId)
//        }
//    })
//    
//    win.webContents.session.on('select-serial-added', (event, portList, callback) => console.log(portList))
//    win.webContents.session.on('select-serial-removed', (event, portList, callback) => console.log(portList))

    win.maximize();
    win.loadFile('index.html')
}

app.commandLine.appendSwitch('enable-features', 'ElectronSerialChooser');

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
