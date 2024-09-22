const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const url="mongodb://localhost:27017/";
const path = require('path');
const bcrypt=require('bcrypt');
const {MongoClient} = require("mongodb");
const client=new MongoClient(url);

app.use(express.urlencoded({ extended: true }));
async function connect(){
	try{
		await client.connect();
		console.log('MongoDB Connected');
	}
	catch(err)
	{
		console.log('err occ');
		process.exit(1);
	}
}

const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define routes for each HTML page
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/about', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'about.html'));
});
app.get('/booking', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'booking.html'));
});
app.get('/reg', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'reg.html'));
});
app.get('/login', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/view_user', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'view_user.html'));
});
app.get('/submission', function (request, response) {
    response.sendFile(path.join(__dirname, 'public', 'submission.html'));
});
app.get('/insert',async function(req,res){
	
	var doc = {
        fullname: req.query.fullname,
        username: req.query.username,
        email: req.query.email,
        phoneNumber: req.query.phone,
        password: req.query.password,
        confirmpassword: req.query.confirmpassword,
        
    };
    var pattern=/^[0-9]{10}$/;
    if (!pattern.test(doc.phoneNumber)) {
        res.send(" Invalid Mobile number ");
    }
    else{
    const db=client.db("photo");
	const coll=db.collection("regusers");
    var existinguser = await coll.findOne({username: doc.username});
    if(existinguser){
        res.send("User already exist");
    }
    else{
	var result=await coll.insertOne(doc);
	res.redirect( 'login.html');
	res.end();
    }
}
});
app.get('/lcheck',async function(req,res) {
    const db=client.db("photo");
	const coll=db.collection("regusers");
try{
    const check = await coll.findOne({username: req.query.username,password:req.query.password});
    if(!check) {
        return res.send("user name cannot found or wrong password");
    }
    else {
        return res.redirect('main.html');
    }
}catch (error) {
    console.error("error", error);
    return res.status(500).send("an error");
}
});
app.get('/alcheck',async function(req,res) {
    const db=client.db("photo");
	const coll=db.collection("adminlogin");
    try{
        const check = await coll.findOne({username: req.query.username,password:req.query.password});
        if(!check) {
            return res.send("admin cannot found or wrong password");
        }
        else {
            return res.redirect('admin.html');
        }
    }catch (error) {
        console.error("error", error);
        return res.status(500).send("an error");
    }
});
app.get('/binsert',async function(req,res){
	
	var doc = {
        fullname: req.query.fullname,
        email: req.query.email,
        event: req.query.event,
        time: req.query.time,
        date: req.query.date,
        number: req.query.number,
        pname:req.query.pname
        
    };
    const db=client.db("photo");
    const coll=db.collection("bookers");
    const check = await coll.findOne({date:doc.date});
    if(check)
    {
        return res.send("Slot already booked...");
    }
    else{
	var result=await coll.insertOne(doc);
    res.redirect('submission.html');
	res.end();
    }
});
app.get('/delete',async function(req,res){
	
	var doc={email:req.query.email};
	const db=client.db("photo");
	const coll=db.collection("regusers");
	var result=await coll.deleteOne(doc);
	
    res.redirect( 'admin.html');

	res.end();
}); 
/*app.get('/findall',async function(req,res){
    const db = client.db("photo");
    const coll = db.collection("regusers");
    var result = await coll.find({},{_id:0,fullname:1,username:1,email:1,phoneNumber:1,password:1}).toArray();
    
	res.write("<h1>USERS:</h1>");
    res.write("<ol>");
    
    for(var i=0;i<result.length;i++)
    {
        res.write("<li>");
        res.write("NAME :"+result[i].username+"<br>"+"EMAIL :"+result[i].email+"<br>"+"MOBILE NO :"+result[i].phoneNumber+"<br>"+"PASSWORD :"+result[i].password+"<br>");
        res.write("</li>");
    }
	res.write("</ol>")
    res.write("||<a href='home.html'>Home</a>");
    res.end();
});*/
app.get('/findall1',async function(req,res){
    const db = client.db("photo");
    const coll = db.collection("bookers");
    var result = await coll.find({},{_id:0,fullname:1,email:1,event:1,time:1,date:1,number:1}).toArray();
    
	res.write("<h1>Booking Details:</h1>");
    res.write("<ol>");
    
    for(var i=0;i<result.length;i++)
    {
        res.write("<li>");
        res.write("NAME :"+result[i].fullname+"<br>"+"EMAIL :"+result[i].email+"<br>"+"EVENT:"+result[i].event+"<br>"+"TIME :"+result[i].time+"<br>"+"DATE :"+result[i].date+"<br>"+"NUMBER:"+result[i].number);
        res.write("</li>");
    }
	res.write("</ol>")
    res.write("||<a href='admin.html'>Home</a>");
    res.end();
});

app.get('/update',async function(req,res){
	
	var doc=req.query.email;
	var newdoc=req.query.npassword;

	const db=client.db("photo");
	const coll=db.collection("regusers");
	var result=await coll.updateOne({email: doc}, {$set:{password:newdoc}});
	res.redirect( 'login.html');

	res.end();
});
app.get('/findall', async function(req, res) {
    const db = client.db("photo");
    const coll = db.collection("regusers");
    
    try {
        var result = await coll.find({}, { _id: 0, role: 0,  username: 1, email: 1, phoneNumber:1, password: 0 }).toArray();
        
        // Start building the HTML response
        let htmlResponse = "<!DOCTYPE html><html><head><title>User Details</title>";
        htmlResponse += "<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; } th { background-color: #f2f2f2; }</style>";
        htmlResponse += "</head><body><h1>User Details</h1>";
        htmlResponse += "<table><thead><tr><th>Username</th><th>email</th><th>Mobile no</th></tr></thead><tbody>";

        // Populate the table rows with user details
        result.forEach(user => {
            htmlResponse += `<tr><td>${user.username}</td><td>${user.email}</td><td>${user.phoneNumber}</td></tr>`;
            // Add more cells for other user details if needed
        });

        htmlResponse += "</tbody></table></body></html>";

        // Send the HTML response
        res.send(htmlResponse);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    }
});
app.get('/viewbook', async function(req, res) {
    const db = client.db("photo");
    const coll = db.collection("bookers");
    
    try {
        var result = await coll.find({}, { _id: 0, role: 0,  fullname: 1, email: 1,time:1,date:1, phoneNumber:0 }).toArray();
        
        // Start building the HTML response
        let htmlResponse = "<!DOCTYPE html><html><head><title>User Details</title>";
        htmlResponse += "<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; } th { background-color: #f2f2f2; }</style>";
        htmlResponse += "</head><body><h1>BOOKING DETAILS</h1>";
        htmlResponse += "<table><thead><tr><th>Name</th><th>Email</th><th>Event</th><th>Time</th><th>Date</th><th>Photographers name</th></tr></thead><tbody>";

        // Populate the table rows with user details
        result.forEach(user => {
            htmlResponse += `<tr><td>${user.fullname}</td><td>${user.email}</td><td>${user.event}</td><td>${user.time}</td><td>${user.date}</td><td>${user.pname}</td></tr>`;
            // Add more cells for other user details if needed
        });

        htmlResponse += "</tbody></table></body></html>";

        // Send the HTML response
        res.send(htmlResponse);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    }
});
app.get('/viewslot', async function(req, res) {
    const db = client.db("photo");
    const coll = db.collection("bookers");
    
    try {
        var result = await coll.find({}, { _id: 0, role: 0, time:1,date:1 }).toArray();
        
        // Start building the HTML response
        let htmlResponse = "<!DOCTYPE html><html><head><title>User Details</title>";
        htmlResponse += "<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; } th { background-color: #f2f2f2; }</style>";
        htmlResponse += "</head><body><h1>BOOKED SLOT</h1>";
        htmlResponse += "<table><thead><tr><th>Time</th><th>Date</th></tr></thead><tbody>";

        // Populate the table rows with user details
        result.forEach(user => {
            htmlResponse += `<tr><td>${user.time}</td><td>${user.date}</td></tr>`;
            // Add more cells for other user details if needed
        });

        htmlResponse += "</tbody></table></body></html>";

        // Send the HTML response
        res.send(htmlResponse);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    }
});

app.post("/", function (request, response) {
    var num1 = request.body.num1;
    response.write("<h1>POST WORKING</h1>");
    response.end();
});

const PORT = 5000;

app.listen(PORT, function () {
    console.log(`Server is running at http://localhost:${PORT}`);
    connect();
});
