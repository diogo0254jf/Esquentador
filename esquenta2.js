// numero usado = 61993806149
const { Client, LocalAuth, MessageMedia, Contact, List, Location, Buttons } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');
const port = process.env.PORT || 8002;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({
extended: true
}));
app.use(fileUpload({
debug: true
}));
app.use("/", express.static(__dirname + "/"))

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot-zdg2' }),
  puppeteer: { headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ] }
});

client.initialize();

io.on('connection', function(socket) {
  socket.emit('message', '© BOT-ZDG - Iniciado');
  socket.emit('qr', './icon.svg');

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', '© BOT-ZDG QRCode recebido, aponte a câmera  seu celular!');
    });
});

client.on('ready', () => {
    socket.emit('ready', '© BOT-ZDG Dispositivo pronto!');
    socket.emit('message', '© BOT-ZDG Dispositivo pronto!');
    socket.emit('qr', './check.svg')	
    console.log('© BOT-ZDG Dispositivo pronto');
});

client.on('authenticated', () => {
    socket.emit('authenticated', '© BOT-ZDG Autenticado!');
    socket.emit('message', '© BOT-ZDG Autenticado!');
    console.log('© BOT-ZDG Autenticado');
});

client.on('auth_failure', function() {
    socket.emit('message', '© BOT-ZDG Falha na autenticação, reiniciando...');
    console.error('© BOT-ZDG Falha na autenticação');
});

client.on('change_state', state => {
  console.log('© BOT-ZDG Status de conexão: ', state );
});

client.on('disconnected', (reason) => {
  socket.emit('message', '© BOT-ZDG Cliente desconectado!');
  console.log('© BOT-ZDG Cliente desconectado', reason);
  client.initialize();
});
});


// Send message
app.post('/send-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = req.body.number;
  const cinco = number.length;
  const numberDDD = number.substr(0, 2);
  const numberDDDb = number.substr(2, 2);
  const numberUser = number.substr(-8, 8);
  const message = req.body.message;
  if (cinco >= 12) {
    
    if (numberDDD <= 30) {
      const numberZDG = "55" + numberDDDb + "9" + numberUser + "@c.us";
      client.sendMessage(numberZDG, message).then(response => {
        res.status(200).json({
          status: true,
          message: 'BOT-ZDG Mensagem enviada',
          response: response
        });
        }).catch(err => {
          res.status(500).json({
            status: false,
            message: 'BOT-ZDG Mensagem não enviada',
            response: err.text
          });
        });
    } else if (numberDDD > 30) {
      const numberZDG = "55" + numberDDDb + numberUser + "@c.us";
      client.sendMessage(numberZDG, message).then(response => {
      res.status(200).json({
        status: true,
        message: 'BOT-ZDG Mensagem enviada',
        response: response
      });
      }).catch(err => {
      res.status(500).json({
        status: false,
        message: 'BOT-ZDG Mensagem não enviada',
        response: err.text
      });
      });
    }
  } else {
    if (numberDDD <= 30) {
      const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
      client.sendMessage(numberZDG, message).then(response => {
      res.status(200).json({
        status: true,
        message: 'BOT-ZDG Mensagem enviada',
        response: response
      });
      }).catch(err => {
      res.status(500).json({
        status: false,
        message: 'BOT-ZDG Mensagem não enviada',
        response: err.text
      });
      });
    }
    else if (numberDDD > 30) {
      const numberZDG = "55" + numberDDD + numberUser + "@c.us";
      client.sendMessage(numberZDG, message).then(response => {
      res.status(200).json({
        status: true,
        message: 'BOT-ZDG Mensagem enviada',
        response: response
      });
      }).catch(err => {
      res.status(500).json({
        status: false,
        message: 'BOT-ZDG Mensagem não enviada',
        response: err.text
      });
      });
    }
  }
});


// Send media
app.post('/send-media', async (req, res) => {
  const number = req.body.number;
  const numberDDD = number.substr(0, 2);
  const numberUser = number.substr(-8, 8);
  const caption = req.body.caption;
  const fileUrl = req.body.file;

  let mimetype;
  const attachment = await axios.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  if (numberDDD <= 30) {
    const numberZDG = "55" + numberDDD + "9" + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, {caption: caption}).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Imagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Imagem não enviada',
      response: err.text
    });
    });
  }

  else if (numberDDD > 30) {
    const numberZDG = "55" + numberDDD + numberUser + "@c.us";
    client.sendMessage(numberZDG, media, {caption: caption}).then(response => {
    res.status(200).json({
      status: true,
      message: 'BOT-ZDG Imagem enviada',
      response: response
    });
    }).catch(err => {
    res.status(500).json({
      status: false,
      message: 'BOT-ZDG Imagem não enviada',
      response: err.text
    });
    });
  }
});

function generateRandomInteger(min, max) {
  return Math.floor(min + Math.random()*(max - min + 1))
}

client.on('message', async msg => {
  let chat = await msg.getChat();
  if (chat.isGroup) { return }
  let random = generateRandomInteger(5000, 10000);
  setTimeout(async () => {
    const saudacaoes = ['oi', "tudo bem?", "Tudo bem!", "Tudo sim! oque manda?",  'Vou no mercado hoje!!',  "Perfeito! vamos montar a lista",  'Perfeito! vamos montar a lista',  "Arroz",  'Arroz',  "Feijão",  'Feijão',  "Macarrao",  'Macarrao',  "Oleo",  'Oleo',  "Suco",  'Suco',  "Coca cola",  'Coca cola',  "acho que é só isso!",  'acho que é só isso!',  "Tudo bem então! quando tiver no mercado me avisa!",  'Tudo bem então! quando tiver no mercado me avisa!',  "Tá bem! tchal!",  'Tá bem! tchal!',  "Bjos","tem o nome?","ou print da pergunta da pessoa?","ai vc fala melhor","ao todo sao 5","tudo mes de setembro","desde quando começamos o disparo?","nenhum","😚","❤️","💲","😂","👍","🤦‍♂️","melhor","grande","rico","primeiro","alto","nobre","superior","belo","perfeito","fino","generoso","divino","especial","brilhante","sublime","ótimo","eminente","precioso","interessante"];
    const esquentador = saudacaoes[Math.floor(Math.random() * saudacaoes.length)];

    if (msg.body !== null) {
      msg.reply(esquentador);
    }
  }, random);

});
    
server.listen(port, function() {
  console.log('App running on *: ' + port);
});
