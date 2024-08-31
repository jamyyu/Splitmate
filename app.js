import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoute.js';
import groupRoutes from './routes/groupRoute.js';
import expenseRoutes from './routes/expenseRoute.js';
import transferRoutes from './routes/transferRoute.js';
import { get404Page } from './controllers/error.js';
import { Server } from 'socket.io';
import { setupSocketIO } from './controllers/socketController.js';


const app = express();

// ES 裡沒有 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 設置靜態文件夾
app.use(express.static(path.join(__dirname, 'public')));

// 登入頁
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/login.html'));
});
//個人檔案頁面
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/profile.html'));
});
//我的群組頁面
app.get('/groups', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/groups.html'));
});
//新增群組頁面
app.get('/groups/create-group', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/create-group.html'));
});
//個別群組頁面
app.get('/group/:groupId', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/group.html'));
});
//編輯個別群組頁面
app.get('/group/:groupId/edit-group', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/edit-group.html'));
});
//查看個別群組頁面
app.get('/group/:groupId/view-group', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/view-group.html'));
});
//新增花費／轉帳頁面
app.get('/group/:groupId/create-record', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/create-record.html'));
});
//花費紀錄頁面
app.get('/expense/:expenseId', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/expense.html'));
});
//轉帳紀錄頁面
app.get('/transfer/:transfer', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/transfer.html'));
});
//結餘頁面
app.get('/group/:groupId/balance', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/balance.html'));
});
//分攤成員及比例設定頁面
app.get('/group/:groupId/create-record/pay', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/pay.html'));
});

//使用者 API
app.use('/', userRoutes);
//群組 API
app.use('/', groupRoutes);
//費用 API
app.use('/', expenseRoutes);
//轉帳 API
app.use('/', transferRoutes);


app.use(get404Page);


// 創建 HTTP 伺服器
const server = http.createServer(app);

// 創建 Socket.IO 伺服器並綁定到 HTTP 伺服器上
const io = new Server(server);

// 使用 Socket.IO 控制器來設置 Socket.IO 事件
setupSocketIO(io);


server.listen(3000, () => {console.log('Server is running on port 3000')});
