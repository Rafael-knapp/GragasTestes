const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mysql = require('mysql2/promise');

let mainWindow;

// Configuração da conexão com o banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'root',      // substitua pelo seu usuário
  password: '',          // substitua pela sua senha
  database: 'gragas'
};

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // certifique-on de que o caminho está correto
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('src/html/login.html'); // Inicia pela tela de login
}

// Ouvinte de Login (IPC)
ipcMain.handle('realizar-login', async (event, credenciais) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, nome, email, tipo_usuario FROM usuarios WHERE email = ? AND senha = ?',
      [credenciais.email, credenciais.senha]
    );

    if (rows.length > 0) {
      return { success: true, user: rows[0] };
    } else {
      return { success: false, message: "E-mail ou senha incorretos." };
    }
  } catch (error) {
    console.error("Erro no Banco:", error);
    return { success: false, message: "Erro ao conectar no banco de dados." };
  } finally {
    if (connection) await connection.end();
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});