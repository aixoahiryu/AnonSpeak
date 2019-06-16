var fs = require("fs");
var express = require("express");
var cookie1 = require("cookie-parser");
var bodyParser = require("body-parser");
var app = express();

const port = process.env.PORT || 80;
var server = app.listen(port, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log("Listening %s:%s", host, port);
})
var io = require('socket.io').listen(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookie1());
app.use('/vendors', express.static('vendors'));
app.use('/build', express.static('build'));
app.use('/database/chatroom', express.static('chatroom'));

var header = fs.readFileSync('app/header.html');
var sidebar = fs.readFileSync('app/sidebar.html');
var topmenu = fs.readFileSync('app/topmenu.html');
var content = fs.readFileSync('app/content.html');
var footer = fs.readFileSync('app/footer.html');

function mainpage(panel, username, room, type) {
	var sidebar2 = sidebar.toString().replace('madcat28651', username);
	sidebar2 = sidebar2.toString().replace('User', type);
	var topmenu2 = topmenu.toString().replace('madcat28651', username);

	var footer2 = footer.toString().replace(/room*'/g, room + "'");

	if (fs.existsSync('database/profile/' + username + '.json')) {
		var profile1 = fs.readFileSync('database/profile/' + username + '.json');
		var json1 = JSON.parse(profile1);

		sidebar2 = sidebar2.toString().replace('madcatavatar', json1.avatar);
		sidebar2 = sidebar2.toString().replace('madcatprofile', username);
		topmenu2 = topmenu2.toString().replace('madcatavatar', json1.avatar);
		topmenu2 = topmenu2.toString().replace('madcatprofile', username);
	}
	else {
		sidebar2 = sidebar2.toString().replace('madcatavatar', 'https://colorlib.com/polygon/gentelella/images/img.jpg');
		sidebar2 = sidebar2.toString().replace('madcatprofile', username);
		topmenu2 = topmenu2.toString().replace('madcatavatar', 'https://colorlib.com/polygon/gentelella/images/img.jpg');
		topmenu2 = topmenu2.toString().replace('madcatprofile', username);
	}

	topmenu2 = topmenu2.toString().replace('madcatnotice', NoticeList());
	topmenu2 = topmenu2.toString().replace('noticenum', noticei);
	return header + sidebar2 + topmenu2 + content + panel + footer2;
}

noticei = 0;

var ItemListEnd = `
			</div>
		</div>
	</div>
</div>`;

function makeItemList(title) {
	var ItemList = `
<div class="col-md-4 col-sm-4 col-xs-12">
	<div class="x_panel">
		<div class="x_title">
			<h2>`+ title + `</h2>
			<div class="clearfix"></div>
		</div>
		<div class="x_content">
			<div class="dashboard-widget-content">
				<ul class="list-unstyled timeline widget">`;
	return ItemList;
}

function makeitem(title, link, group) {
	return `
<li>
	<div class="block">
		<div class="block_content">
			<h2 class="title">
<a href="/`+ group + `?id=` + link + `">` + title.toString().replace('.json', '') + `</a>
</h2>
			<div class="byline">
				<span>13 hours ago</span> by <a>madcat28651</a>
			</div>
		</div>
	</div>
</li>`;
}

function FriendList(id) {
	var friendlist = "";
	var list1, list2;

	if (fs.existsSync('database/friendlist/' + id + '.json')) {
		if (id.trim() == "All") {
			console.log(id);
			list2 = fs.readdirSync('database/account');
			list2.forEach(function (i) {
				i = i.replace('.json', '');
			})

		}
		else {
			list1 = fs.readFileSync('database/friendlist/' + id + '.json');
			list2 = list1.toString().split(',');
		}

		list2.forEach(function (i) {
			if (fs.existsSync('database/profile/' + i + '.json')) {
				var userdata = fs.readFileSync('database/profile/' + i + '.json');
				var json1 = JSON.parse(userdata);
				userdata = fs.readFileSync('database/account/' + i + '.json');
				var json2 = JSON.parse(userdata);
				friendlist = friendlist + `<tr><td><img style="max-width:50px" src="` + json1.avatar + `">
		<td>`+ json1.name + `</td>
		<td>`+ json1.address + `</td>
		<td>`+ json1.job + `</td>
		<td>`+ json1.website + `</td>
		<td>`+ json2.banned + `</td>
		<td>
	<a href="/profile?id=`+ i + `" class="btn btn-primary btn-xs">
		<i class="fa fa-folder"></i> View Profile</a>
	<a href="/add-friend?id=`+ i + `" class="btn btn-info btn-xs">
		<i class="fa fa-pencil"></i> Add Friend </a>
	<a href="/ban?id=`+ i + `" class="btn btn-danger btn-xs">
		<i class="fa fa-trash-o"></i> Ban </a>
</td>
</tr>
`;
			}


		});
	}

	friendlist = `<table class="table table-striped projects">
	<thead>
		<tr>
			<th>Ảnh đại diện</th>
			<th>Họ Tên</th>
			<th>Địa chỉ</th>
			<th>Nghề nghiệp</th>
			<th>Website</th>
			<th>Banned</th>
			<th>#Edit</th>
		</tr>
	</thead>
	<tbody>
	`+ friendlist + `
	</tbody>
	</table>`


	return friendlist;
}

function NoticeList() {
	var noticedata = fs.readFileSync('database/thongbao');
	var data = noticedata.toString().split("\r\n");
	noticedata = '';
	noticei = 0;
	data.forEach(function (i2) {
		noticedata = noticedata + `<li>
		<a>
			<span class="image"><img src="https://colorlib.com/polygon/gentelella/images/img.jpg" alt="Profile Image"></span>
			<span>
		<span>Thông báo</span>
			<span class="time">3 mins ago</span>
			</span>
			<span class="message">
		`+ i2 + `
	</span>
		</a>
	</li>`;
		noticei = noticei + 1;
	})

	return noticedata;
}

//-------------------Login-------------------
app.get('/', function (req, res) {
	console.log(req.cookies);

	if (req.cookies["username"] == null) {
		res.redirect('login');
	}
	else {
		/*var html = mainpage("Welcome");
		res.send(html);
		res.end();*/

		var panel = fs.readFileSync('app/panel/dashboard.html');
		if (fs.existsSync('database/account/' + req.cookies["username"] + '.json')) {
			var profile1 = fs.readFileSync('database/profile/' + req.cookies["username"] + '.json');
			var json1 = JSON.parse(profile1);
			panel = panel.toString().replace('madcatavatar', json1.avatar);
			panel = panel.toString().replace('madcatname', json1.name);
			panel = panel.toString().replace('madcataddress', json1.address);
			panel = panel.toString().replace('madcatjob', json1.job);
			panel = panel.toString().replace('madcatwebsite', json1.website);
			panel = panel.toString().replace('madcatgioithieu', json1.description);
			panel = panel.toString().replace('madcatp1', json1.p1);
			panel = panel.toString().replace('madcatp2', json1.p2);
			panel = panel.toString().replace('madcatp3', json1.p3);
			panel = panel.toString().replace('madcatp4', json1.p4);
			var friendlist = FriendList(req.cookies["username"]);
			panel = panel.toString().replace('madcatfriendlist', friendlist);
		}

		var list1 = makeItemList('Đại sảnh');
		list1 = list1 + makeitem('Thông báo', 1, 'r');
		list1 = list1 + makeitem('Thắc mắc & góp ý', 2, 'r');
		list1 = list1 + ItemListEnd;

		var list2 = makeItemList('Khu vui chơi giải trí');
		list2 = list2 + makeitem('Chuyện trò linh tinh', 3, 'r');
		list2 = list2 + makeitem('Điểm báo', 4, 'r');
		list2 = list2 + ItemListEnd;

		var list3 = makeItemList('Mua & bán');
		list3 = list3 + makeitem('Laptop', 5, 'r');
		list3 = list3 + makeitem('Desktop', 6, 'r');
		list3 = list3 + makeitem('Điện thoại', 7, 'r');
		list3 = list3 + ItemListEnd;

		type = 'User'; if (req.cookies["user"] != '1') type = 'Anonymous';
		var html = mainpage(panel + list1 + list2 + list3, req.cookies.username, '', type);
		res.send(html);
	}
})

app.get('/logout', function (req, res) {
	res.clearCookie("tutorial");
	res.clearCookie("username");
	res.clearCookie("user");

	res.redirect('/login');
})

app.get('/login', function (req, res) {
	var html = fs.readFileSync('app/login.html');
	res.set('Content-Type', 'Text/Html');
	if (req.query.tutorial = 'yes') { res.cookie('tutorial', 'yes', { maxAge: 900000000, httpOnly: true }); }
	res.send(html);
})

app.post('/login', function (req, res) {

	res.set('Content-Type', 'Text/Html');
	if (req.body.username != '') {
		res.cookie('username', req.body.username, { maxAge: 900000000, httpOnly: true });
		res.redirect('/');
	}
	else { res.send("Login failed"); }
})

app.post('/login2', function (req, res) {

	res.set('Content-Type', 'Text/Html');
	if (fs.existsSync('database/account/' + req.body.username + '.json')) {
		var userdata = fs.readFileSync('database/account/' + req.body.username + '.json');
		var json1 = JSON.parse(userdata);
		if (req.body.password == json1.password) {
			res.cookie('username', req.body.username, { maxAge: 900000000, httpOnly: true });
			res.cookie('user', '1', { maxAge: 900000000, httpOnly: true });
			res.redirect('/');
		}
	}
	else { res.send("Login failed"); }
})

app.post('/register', function (req, res) {
	var json1 = {
		"password": "",
		"banned": "0",
		"unread": ""
	};
	json1.password = req.body.password;
	var json2 = {
		"avatar": "https://store.playstation.com/store/api/chihiro/00_09_000/container/TR/tr/99/EP2402-CUSA05624_00-AV00000000000098//image?_version=00_09_000&platform=chihiro&w=720&h=720&bg_color=000000&opacity=100",
		"name": "Samuel Doe",
		"address": "San Francisco, California, USA",
		"job": "Software Engineer",
		"website": "www.kimlabs.com",
		"description": "Giới thiệu",
		"p1": "10",
		"p2": "20",
		"p3": "30",
		"p4": "40"
	};
	var userdata = JSON.stringify(json1);
	fs.writeFileSync('database/account/' + req.body.username + '.json', userdata);
	var userdata = JSON.stringify(json2);
	fs.writeFileSync('database/profile/' + req.body.username + '.json', userdata);

	res.cookie('username', req.body.username, { maxAge: 900000000, httpOnly: true });
	res.cookie('user', '1', { maxAge: 900000000, httpOnly: true });
	res.redirect('/');
})

app.post('/loginX', function (req, res) {

	res.set('Content-Type', 'Text/Html');
	if (req.body.username != '') {
		res.cookie('username', req.body.username, { maxAge: 900000000, httpOnly: true });
		res.redirect('/r?id=1&tutorial_anonymous=yes');
	}
	else { res.send("Login failed"); }
})

app.post('/login2X', function (req, res) {

	res.set('Content-Type', 'Text/Html');
	if (fs.existsSync('database/account/' + req.body.username + '.json')) {
		var userdata = fs.readFileSync('database/account/' + req.body.username + '.json');
		var json1 = JSON.parse(userdata);
		if (req.body.password == json1.password) {
			res.cookie('username', req.body.username, { maxAge: 900000000, httpOnly: true });
			res.cookie('user', '1', { maxAge: 900000000, httpOnly: true });
			res.redirect('/r?id=1&tutorial_user=yes');
		}
	}
	else { res.send("Login failed"); }
})

app.post('/registerX', function (req, res) {
	var json1 = {
		"password": "",
		"banned": "0",
		"unread": ""
	};
	json1.password = req.body.password;
	var json2 = {
		"avatar": "https://store.playstation.com/store/api/chihiro/00_09_000/container/TR/tr/99/EP2402-CUSA05624_00-AV00000000000098//image?_version=00_09_000&platform=chihiro&w=720&h=720&bg_color=000000&opacity=100",
		"name": "Samuel Doe",
		"address": "San Francisco, California, USA",
		"job": "Software Engineer",
		"website": "www.kimlabs.com",
		"description": "Giới thiệu",
		"p1": "10",
		"p2": "20",
		"p3": "30",
		"p4": "40"
	};
	var userdata = JSON.stringify(json1);
	fs.writeFileSync('database/account/' + req.body.username + '.json', userdata);
	var userdata = JSON.stringify(json2);
	fs.writeFileSync('database/profile/' + req.body.username + '.json', userdata);

	res.cookie('username', req.body.username, { maxAge: 900000000, httpOnly: true });
	res.cookie('user', '1', { maxAge: 900000000, httpOnly: true });
	res.redirect('/r?id=1&tutorial_user=yes');
})

app.get('/add-friend', function (req, res) {
	if (req.query.id != '' && fs.existsSync('database/account/' + req.cookies["username"] + '.json')) {
		if (fs.existsSync('database/friendlist/' + req.cookies["username"] + '.json') == false) {
			fs.appendFileSync('database/friendlist/' + req.cookies["username"] + '.json', req.query.id + ',', { flag: "a+" });
		}
		else {
			var friendlist = fs.readFileSync('database/friendlist/' + req.cookies["username"] + '.json');
			var friendarray = friendlist.toString().split(',');
			if (friendarray.includes(req.query.id) == false) {
				fs.appendFileSync('database/friendlist/' + req.cookies["username"] + '.json', req.query.id + ',');
			}
		}
	}

	res.redirect('/');
})

app.get('/ban', function (req, res) {
	if (req.cookies["adminname"] == null) {
		res.redirect('/admin/login');
	}
	else {
		if (req.query.id != '' && fs.existsSync('database/account/' + req.query.id + '.json')) {
			var userdata = fs.readFileSync('database/account/' + req.query.id + '.json');
			var json1 = JSON.parse(userdata);
			if (json1.banned == 0) { json1.banned = 1 }
			else { json1.banned = 0 }
			userdata = JSON.stringify(json1);

			fs.writeFileSync('database/account/' + req.query.id + '.json', userdata);
		}
	}

	res.redirect('/');
})

app.get('/profile', function (req, res) {
	if (fs.existsSync('database/account/' + req.query.id + '.json')) {
		var panel = fs.readFileSync('app/panel/dashboard.html');
		var profile1 = fs.readFileSync('database/profile/' + req.query.id + '.json');
		var json1 = JSON.parse(profile1);
		panel = panel.toString().replace('madcatavatar', json1.avatar);
		panel = panel.toString().replace('madcatname', json1.name);
		panel = panel.toString().replace('madcataddress', json1.address);
		panel = panel.toString().replace('madcatjob', json1.job);
		panel = panel.toString().replace('madcatwebsite', json1.website);
		panel = panel.toString().replace('madcatgioithieu', json1.description);
		panel = panel.toString().replace('madcatp1', json1.p1);
		panel = panel.toString().replace('madcatp2', json1.p2);
		panel = panel.toString().replace('madcatp3', json1.p3);
		panel = panel.toString().replace('madcatp4', json1.p4);
		panel = panel.toString().replace('madcatid', req.query.id);
		var friendlist = FriendList(req.query.id);
		panel = panel.toString().replace('madcatfriendlist', friendlist);

		type = 'User'; if (req.cookies["user"] != '1') type = 'Anonymous';
		var html = mainpage(panel, req.cookies.username, '', type);
		res.send(html);
	}
	else {
		res.redirect('/');
	}
})

app.get('/options', function (req, res) {
	var panel = fs.readFileSync('app/panel/option.html');
	var profile1 = fs.readFileSync('database/profile/' + req.cookies["username"] + '.json');
	var json1 = JSON.parse(profile1);
	panel = panel.toString().replace('madcatavatar', json1.avatar);
	panel = panel.toString().replace('madcatname', json1.name);
	panel = panel.toString().replace('madcataddress', json1.address);
	panel = panel.toString().replace('madcatjob', json1.job);
	panel = panel.toString().replace('madcatwebsite', json1.website);
	panel = panel.toString().replace('madcatgioithieu', json1.description);
	panel = panel.toString().replace('madcatp1', json1.p1);
	panel = panel.toString().replace('madcatp2', json1.p2);
	panel = panel.toString().replace('madcatp3', json1.p3);
	panel = panel.toString().replace('madcatp4', json1.p4);

	type = 'User'; if (req.cookies["user"] != '1') type = 'Anonymous';
	var html = mainpage(panel, req.cookies.username, '', type);
	res.send(html);
})

app.post('/options', function (req, res) {
	var profile1 = fs.readFileSync('database/profile/' + req.cookies["username"] + '.json');
	var json1 = JSON.parse(profile1);

	json1.avatar = req.body.avatar;
	json1.name = req.body.name;
	json1.address = req.body.address;
	json1.job = req.body.job;
	json1.website = req.body.website;
	json1.description = req.body.description;
	json1.p1 = req.body.p1;
	json1.p2 = req.body.p2;
	json1.p3 = req.body.p3;
	json1.p4 = req.body.p4;

	var userdata = JSON.stringify(json1);
	fs.writeFileSync('database/profile/' + req.cookies["username"] + '.json', userdata);
	res.redirect('/options');
})

app.post('/options2', function (req, res) {
	var userdata = fs.readFileSync('database/account/' + req.cookies["username"] + '.json');
	var json1 = JSON.parse(userdata);

	if ((req.body.password_old == json1.password) && (req.body.password_1 == req.body.password_2)) {
		json1.password = req.body.password_1;
		var userdata = JSON.stringify(json1);
		fs.writeFileSync('database/account/' + req.cookies["username"] + '.json', userdata);
		res.redirect('/options');
	}
	else { res.send("Đổi mật khẩu không thành công"); }


})

//-------------Form---------------
app.get('/r', function (req, res) {
	type = 'User'; if (req.cookies["user"] != '1') type = 'Anonymous';
	if (fs.existsSync('database/account/' + req.cookies["username"] + '.json')) {
		var userdata = fs.readFileSync('database/account/' + req.cookies["username"] + '.json');
		var json1 = JSON.parse(userdata);
		if (json1.banned == 1) { type = 'Banned' }
	}

	if (req.query.id != undefined) {
		panel = fs.readFileSync('app/panel/chatbox.html');
		chatdata = fs.readFileSync('database/chatroom/' + req.query.id + '.txt');
		panel = panel.toString().replace('madcatchatdata', chatdata);
		var html = mainpage(panel, req.cookies.username, 'room' + req.query.id.toString(), type);

	}
	else {
		//res.redirect('/');
		panel = fs.readFileSync('app/panel/chatbox.html');
		chatdata = fs.readFileSync('database/chatroom/r.txt');
		panel = panel.toString().replace('madcatchatdata', chatdata);
		var html = mainpage(panel, req.cookies.username, 'room', type);
	}
	res.send(html);
})

io.on('connection', function (socket) {
	socket.on('room', function (msg) {
		io.emit('room', msg);
		fs.appendFileSync('database/chatroom/r.txt', '<li>' + msg + '</li> \r\n');
	});

	socket.on('room1', function (msg) {
		io.emit('room1', msg);
		fs.appendFileSync('database/chatroom/1.txt', '<li>' + msg + '</li> \r\n');
	});

	socket.on('room2', function (msg) {
		io.emit('room2', msg);
		fs.appendFileSync('database/chatroom/2.txt', '<li>' + msg + '</li> \r\n');
	});

	socket.on('room3', function (msg) {
		io.emit('room3', msg);
		fs.appendFileSync('database/chatroom/3.txt', '<li>' + msg + '</li> \r\n');
	});

	socket.on('room4', function (msg) {
		io.emit('room4', msg);
		fs.appendFileSync('database/chatroom/4.txt', '<li>' + msg + '</li> \r\n');
	});

	socket.on('room5', function (msg) {
		io.emit('room5', msg);
		fs.appendFileSync('database/chatroom/5.txt', '<li>' + msg + '</li> \r\n');
	});

	socket.on('room6', function (msg) {
		io.emit('room6', msg);
		fs.appendFileSync('database/chatroom/6.txt', '<li>' + msg + '</li> \r\n');
	});

	socket.on('room7', function (msg) {
		io.emit('room7', msg);
		fs.appendFileSync('database/chatroom/7.txt', '<li>' + msg + '</li> \r\n');
	});
});

app.get('/admin/login', function (req, res) {
	var html = fs.readFileSync('app/admincp/login.html');
	res.set('Content-Type', 'Text/Html');
	res.clearCookie("adminname");
	res.clearCookie("password");
	res.send(html);
})

app.post('/admin/login', function (req, res) {

	res.set('Content-Type', 'Text/Html');
	if (req.body.password == fs.readFileSync('database/admin/' + req.body.username + '.json')) {
		res.cookie('adminname', req.body.username, { maxAge: 900000000, httpOnly: true });
		res.redirect('/admin/ban');
	}
	else { res.send("Login failed"); }
})

app.get('/admin', function (req, res) {
	if (req.cookies["adminname"] == null) {
		res.redirect('/admin/login');
	}
	else {
		if (req.query.delete != undefined) {
			fs.unlinkSync('database/admin/' + req.query.delete + '.json');
			res.redirect('/admin');
			return;
		}

		var DeleteButton = `<a href="/admin?delete=` + req.query.id + `"><button class="btn btn-primary">Delete</button></a>`;
		if (req.query.id != undefined) {
			var AccountPassword = fs.readFileSync('database/admin/' + req.query.id + '.json');
			panel = fs.readFileSync('app/admincp/form.admin.html');
			panel = panel.toString().replace("madcatusername", req.query.id);
			panel = panel.toString().replace("madcatpassword", AccountPassword);
			panel = panel.toString().replace("madcatdelete", DeleteButton);
		}
		else {
			var panel = fs.readFileSync('app/admincp/form.admin.html');
			panel = panel.toString().replace("madcatusername", "");
			panel = panel.toString().replace("madcatpassword", "");
			panel = panel.toString().replace("madcatdelete", "");
		}
		var list1 = makeItemList('Database');

		fs.readdir('database/admin', (err, files) => {
			files.forEach(file => {
				list1 = list1 + makeitem(file, file.toString().replace('.json', ''), 'admin');
			});

			list1 = list1 + ItemListEnd;

			var sidebar2 = fs.readFileSync('app/admincp/sidebar.html');
			sidebar2 = sidebar2.toString().replace('madcat28651', req.cookies.adminname);
			var topmenu2 = topmenu.toString().replace('madcat28651', req.cookies.adminname);
			var html = header + sidebar2 + topmenu2 + content + panel + list1;
			res.send(html);
		})
	}
})

app.post('/admin', function (req, res) {
	fs.appendFileSync('database/admin/' + req.body.username + '.json', req.body.password);
	res.redirect('/admin');
})

app.get('/admin/user', function (req, res) {
	if (req.cookies["adminname"] == null) {
		res.redirect('/admin/login');
	}
	else {
		if (req.query.delete != undefined) {
			fs.unlinkSync('database/account/' + req.query.delete + '.json');
			res.redirect('/admin/user');
			return;
		}

		var DeleteButton = `<a href="/admin?delete=` + req.query.id + `"><button class="btn btn-primary">Delete</button></a>`;
		if (req.query.id != undefined) {
			var userdata = fs.readFileSync('database/account/' + req.query.id + '.json')
			var AccountPassword = JSON.parse(userdata).password;
			panel = fs.readFileSync('app/admincp/form.account.html');
			panel = panel.toString().replace("madcatusername", req.query.id);
			panel = panel.toString().replace("madcatpassword", AccountPassword);
			panel = panel.toString().replace("madcatdelete", DeleteButton);
		}
		else {
			var panel = fs.readFileSync('app/admincp/form.account.html');
			panel = panel.toString().replace("madcatusername", "");
			panel = panel.toString().replace("madcatpassword", "");
			panel = panel.toString().replace("madcatdelete", "");
		}
		var list1 = makeItemList('Database');

		fs.readdir('database/account', (err, files) => {
			files.forEach(file => {
				list1 = list1 + makeitem(file, file.toString().replace('.json', ''), 'admin/user');
			});

			list1 = list1 + ItemListEnd;

			var sidebar2 = fs.readFileSync('app/admincp/sidebar.html');
			sidebar2 = sidebar2.toString().replace('madcat28651', req.cookies.adminname);
			var topmenu2 = topmenu.toString().replace('madcat28651', req.cookies.adminname);
			var html = header + sidebar2 + topmenu2 + content + panel + list1;
			res.send(html);
		})
	}
})

app.post('/admin/user', function (req, res) {


	var userdata = fs.readFileSync('database/account/' + req.body.username + '.json')
	var json1 = JSON.parse(userdata);
	json1.password = req.body.password;
	userdata = JSON.stringify(json1);
	fs.writeFileSync('database/account/' + req.body.username + '.json', userdata);

	res.redirect('/admin/user');
})

app.get('/admin/chatroom', function (req, res) {
	if (req.cookies["adminname"] == null) {
		res.redirect('/admin/login');
	}
	else {
		if (req.query.reset != undefined) {
			fs.writeFileSync('database/chatroom/' + req.query.reset + '.txt', '');
			res.redirect('/admin/chatroom');
			return;
		}
		var panel = fs.readFileSync('app/admincp/chatroom.html');
		var sidebar2 = fs.readFileSync('app/admincp/sidebar.html');
		sidebar2 = sidebar2.toString().replace('madcat28651', req.cookies.adminname);
		var topmenu2 = topmenu.toString().replace('madcat28651', req.cookies.adminname);
		var html = header + sidebar2 + topmenu2 + content + panel;
		res.send(html);
	}
})

app.get('/admin/ban', function (req, res) {
	if (req.cookies["adminname"] == null) {
		res.redirect('/admin/login');
	}
	else {
		var friendlist = FriendList('test1');

		var panel = friendlist;
		var sidebar2 = fs.readFileSync('app/admincp/sidebar.html');
		sidebar2 = sidebar2.toString().replace('madcat28651', req.cookies.adminname);
		var topmenu2 = topmenu.toString().replace('madcat28651', req.cookies.adminname);
		var html = header + sidebar2 + topmenu2 + content + panel;

		res.send(html);
	}
})

app.get('/admin/notice', function (req, res) {
	if (req.cookies["adminname"] == null) {
		res.redirect('/admin/login');
	}
	else {

		var panel = fs.readFileSync('app/admincp/notice.html');
		if (fs.existsSync('database/thongbao')) {
			var noidung = fs.readFileSync('database/thongbao');
			panel = panel.toString().replace('madcatthongbao', noidung);
		}
		var sidebar2 = fs.readFileSync('app/admincp/sidebar.html');
		sidebar2 = sidebar2.toString().replace('madcat28651', req.cookies.adminname);
		var topmenu2 = topmenu.toString().replace('madcat28651', req.cookies.adminname);
		var html = header + sidebar2 + topmenu2 + content + panel;

		res.send(html);
	}
})

app.post('/admin/notice', function (req, res) {
	fs.writeFileSync('database/thongbao', req.body.description);

	res.redirect('/admin/notice');
})

//----------------------API----------------------
app.get('/api/update', function (req, res) {
	res.setHeader("Content-Type", "application/json");

	var data1 = fs.readFileSync('database/update.json');
	res.send(data1);
})

app.get('/api/message/:id', function (req, res) {
	res.setHeader("Content-Type", "application/json");

	chatdata = fs.readFileSync('database/chatroom/' + req.params.id + '.txt');
	res.send(chatdata);
})

app.post('/api/message', function (req, res) {
	io.emit('room' + req.body.room, req.body.msg);
	fs.appendFileSync('database/chatroom/'+req.body.room+'.txt', '<li>' + req.body.msg + '</li> \r\n');
	res.send('Success');
})

app.get('/api/user/:id', function (req, res) {
	res.setHeader("Content-Type", "application/json");

	var profile1 = fs.readFileSync('database/profile/' + req.params.id + '.json');
	res.send(profile1);
})

app.post('/api/user', function (req, res) {
	var profile1 = fs.readFileSync('database/profile/' + req.body.username + '.json');
	var json1 = JSON.parse(profile1);

	json1.avatar = req.body.profile.avatar;
	json1.name = req.body.profile.name;
	json1.address = req.body.profile.address;
	json1.job = req.body.profile.job;
	json1.website = req.body.profile.website;
	json1.description = req.body.profile.description;
	json1.p1 = req.body.profile.p1;
	json1.p2 = req.body.profile.p2;
	json1.p3 = req.body.profile.p3;
	json1.p4 = req.body.profile.p4;

	var userdata = JSON.stringify(json1);
	fs.writeFileSync('database/profile/' + req.body.username + '.json', userdata);
	res.send('Success');
})

app.post('/api/authenticate', function (req, res) {

	res.send('Success');
})