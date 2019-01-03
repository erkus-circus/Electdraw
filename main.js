
const {app, BrowserWindow, ipcMain,dialog} = require('electron')
let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600})

  mainWindow.setMinimumSize(200,200)

  mainWindow.loadFile('index.html')


  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

const errMsgOpts = {
  type: 'error',
  buttons: ['Ok']
}

ipcMain.on('error',(err,name='An Error Has Occured')=>{
  console.log(err);
  dialog.showErrorBox(name, 'An error has occured. Check console for more details')
})