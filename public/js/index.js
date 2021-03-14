const socket = io(); // 不需要写url，他会默认连接到提供当前页面的主机
const user = {
    userName: null,
    profile: null
};

// 系统消息
socket.on('systemMsg', ({msg, count}) => { // send的是服务器触发的
    // 添加消息
    const p = document.createElement('p');
    p.innerHTML = msg;
    p.className = 'systemMsg'
    document.getElementById('view').appendChild(p);
    p.scrollIntoView({
        behavior: 'smooth',
        block : 'start'
    })
    // 更新群人数
    $('#roomTitle').html(`群聊(${count})`);
})
// 聊天消息
socket.on('chatMsg', ({name, profile, content }) => {
    const div = document.createElement('div');
    if(name === user.userName){
        div.innerHTML = `<img class='profile' src='${profile}' draggable="false" >
        <div class='content'>${content}</div>`;
        div.className = 'myMsg';
    }else{
        div.innerHTML = `<img class='profile' src='${profile}' draggable="false" >
        <span class='name'>${name}</span>
        <div class='content'>${content}</div>`;
        div.className = 'otherMsg';
    }
    document.getElementById('view').appendChild(div);
    $(div).find('img').on('load',() => {
        div.scrollIntoView({
            behavior: 'smooth',
            block : 'end'
        })
    })
    
})

// 头像样式

$('#profileBox').on('click', (event) =>{
    const target = event.target;
    if(target.nodeName === 'IMG'){
        $('#profileBox').find('img').removeClass('now');
        target.className = 'now';  
    }
})
// 点击登录按钮开始登录
$('#loginBtn').on('click', () => {
    const userName = $('#loginUser').val().trim();
    const profile = $('#profileBox').find('.now').attr('src');
    console.log('登录！');
   // 验证用户名是否存在
    if(! userName){
        alert('请输入用户名！');
        return;
    }
    // 验证是否有选头像
    if(! profile){
        alert("请选择一个头像！");
        return;
    }
    // 发送请求
    socket.emit('login', {userName, profile});
    console.log('发送请求'); 
})
// 登录失败
socket.on('loginError', data => alert(data));
// 登录成功
socket.on('loginSucceed', ({userName, profile}) =>{
    // 关闭登录面板
    $('#loginBox').fadeOut(500);
    // 打开聊天页
    $('#chatBox').fadeIn(500);
    // 展示个人信息
    user.userName = userName;
    user.profile = profile;
    displayUserInfo();
})

function displayUserInfo(){
    console.log(user);
    $('#userPlane').find('img').attr('src', user.profile);
    $('#userPlane').find('span').html(user.userName);
}

// 刷新成员列表
socket.on('refreshFriendList', (users) => {
    // 用fragment树
    // 减少dom树变化，减少页面渲染次数
    const fragment = document.createDocumentFragment();
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerHTML = `
        <img src='${user.profile}' draggable="false" >
        <span>${user.userName}</span>`;
        fragment.appendChild(li);
    })
    $('#friendList').html(fragment);
})

// 发送消息

function sendMsg(){
    const msg = $('#text').html().trim();
    console.log(msg);
    $('#text').html('');
    if (!msg) {
        alert('不能发送空内容！');
        return;
    }
    // 发送消息
    socket.emit('receiveMsg', {name: user.userName, profile: user.profile, content:msg});
}

//点击发送按钮发送

// socket可以直接发送和接受json数据，甚至二进制数据
document.getElementById('send').onclick = () => {
    sendMsg();
};

// 回车键发送
document.getElementById('text').onkeydown = (event) => {
    
    if(event.key === 'Enter' || event.keyCode === 13){
        event.preventDefault();
        sendMsg();
    }
}

// 读取拖拽文件
function readImg(event){
    event.preventDefault();
    if(event.type == 'drop'){
        files = event.dataTransfer.files;
        url = window.URL.createObjectURL(files[0]); // 一种读取本地文件的方法
        console.log(url);
        if (url) {
            if (/image/.test(files[0].type)) {
                document.getElementById('text').innerHTML += `<img src="${url}">`;
            }
        } 
    }
}


document.getElementById('text').addEventListener("dragenter", readImg);
document.getElementById('text').addEventListener("dragover", readImg);
document.getElementById('text').addEventListener("drop", readImg); 

// 点击发送图片

$('#imgBtn').on('click', () => {
    $('#selectFile').click();
})

$('#selectFile').on('change',(event) => {
    const files = event.target.files;
    const url = window.URL.createObjectURL(files[0]);
    if(url){
        if (/image/i.test(files[0].type)) {
            document.getElementById('text').innerHTML += `<img src = '${url}' draggable="false" >`
        }else{
            alert('只能选择图片！')
        }
    }
})


// 表情发送
$('#faceBtn').on('click',() => {
    // 
    console.log('表情');
    $("#text").emoji({
        button: "#faceBtn",
        showTab: false,
        animation: 'slide',
        icons: [{
            name: "QQ表情",
            path: "src/img/qq/",
            maxNum: 91,
            excludeNums: [41, 45, 54],
            file: ".gif"
        }]
    });
   
})
