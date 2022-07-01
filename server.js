var express = require('express');
var bodyParser = require('body-parser');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose')

var Message = mongoose.model('message', {
    name: String,
    message: String
})

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var dbUrl = 'mongodb+srv://gambit_01:kO8D2i7a7Hj9DP0x@cluster0.msggq.mongodb.net/?retryWrites=true&w=majority';

app.get('/messages', (req, res) => {
    Message.find({}, (err, message) => {
        res.send(message)
    })
});

app.get('/messages/:user', (req, res) => {
    var user = req.params.user;
    Message.find({name: user}, (err, message) => {
        res.send(message)
    })
});

app.post('/messages', async (req, res) => {

    try {
        var message = new Message(req.body);
        var savedMessage = await message.save();
        console.log("saved");
        var censored = await Message.findOne({ message: 'badword' });

        if (censored)
            await Message.remove({ _id: censored.id })
        else
            io.emit('message', req.body);
        res.sendStatus(200);
    } catch (err) {
        res.sendStatus(500);
        console.log(err);
    }finally{
        console.log('save executed')
    }


})

io.on('connection', (socket) => {
    console.log('a user connected');
})

mongoose.connect(dbUrl, (err) => console.log('mongo db connection ' + err));

var server = http.listen(3000, () => {
    console.log("server is listening on port", server.address().port)
});

