import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoute.js';
import groupRoutes from './routes/groupRoute.js';
import expenseRoutes from './routes/expenseRoute.js';
import { get404Page } from './controllers/error.js';


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
//新增花費／轉帳頁面
app.get('/group/:groupId/create-record', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/create-record.html'));
});
//花費紀錄頁面
app.get('/record/:expenseId', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/record.html'));
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







app.use(get404Page);

const server = http.createServer(app);
server.listen(3000, () => {console.log('Server is running on port 3000')});
