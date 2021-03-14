const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http); // 通过http来初始化ws服务器
const users = [];

// 创建 / 时的路由
app.get('/', (req, res) => {
    res.redirect('/index.html');
})

// 内置中间件--静态资源托管
app.use(express.static('public'));

// 错误处理中间件
app.use((req, res, next) => {
    res.status(404).send('<h1>404, 页面不存在哦！</h1>');
})

http.listen(8001, () => {
    console.log('listen on 8001');
})

// 用户连接后就会创建一个socket对象

// socket是有两个方法
// socket.emit() ，触发浏览器的事件
// socket.on(), 注册某个事件，当浏览器触发时，它就执行

// 广播方法：
// 1. 要将事件发送给每个用户，Socket.IO 提供了 io.emit 方法：
// 2. 要将消息发给除特定 socket 外的其他用户，可以用 broadcast 标志：
io.on('connection', (socket) => {
    console.log('a user connect!');
    // io.emit('loginMsg', `用户${socket.user}进入了群聊`); // 广播, 包括发送者
    // 处理消息接收
    socket.on('receiveMsg', data => {
        console.log(data);
        io.emit('chatMsg', data)
    })
    // 关闭连接
    socket.on('disconnect', function () {
        // 防止没有登录直接关闭
        console.log(socket.user);
        if (socket.user) {
            // 清除该用户
            const index = users.findIndex(value => value.userName === socket.user);
            users.splice(index, 1);
            io.emit('systemMsg', { msg: `${socket.user}退出了群聊`, count: users.length });
            // 刷新用户列表
            io.emit('refreshFriendList', users);
        }
    });
    // 处理登录
    socket.on('login', (user) => {

        if (users.find(value => value.userName === user.userName)) {
            socket.emit('loginError', "抱歉，该用户已存在！");
            return;
        }
        socket.user = user.userName;
        users.push(user);

        console.log(users);
        socket.emit('loginSucceed', user);
        // 广播
        io.emit('systemMsg', { msg: `${socket.user}进入群聊`, count:users.length });
        // 刷新用户列表
        io.emit('refreshFriendList', users);
    })
})








