const Discord = require('discord.js');
const { prefix, token,TWITTER_CONSUMER_KEY,TWITTER_CONSUMER_SECRET, TWITTER_BEARER_TOKEN,TWITTER_ACCESS_TOKEN_KEY,TWITTER_ACCESS_TOKEN_SECRET, YOUTUBE_API_KEY, client_idGOOGLE,client_secretGOOGLE,redirect_urisGOOGLE } = require("./config.json");

const randomPuppy = require('random-puppy');
const fetch = require('node-fetch');
let {PythonShell} = require('python-shell')
const myBot = new Discord.Client();
const fs = require('fs');
const jsonFich = require("fs");
const twitter = require("twit");
var http = require("http");
const { link } = require('snekfetch');
const { google, GoogleApis } =  require('googleapis')

const googleAuth = new google.auth.OAuth2(client_idGOOGLE,client_secretGOOGLE,redirect_urisGOOGLE);


const youtube = google.youtube({
    version:'v3',
    auth: YOUTUBE_API_KEY
})

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { firebasedynamiclinks } = require('googleapis/build/src/apis/firebasedynamiclinks');
myBot.once('ready', () =>{
    console.log('I am ready!\n');
    //console.log(myBot.user);
    myBot.user.setActivity('com a tua mae 😈', { type: 'PLAYING' })
});

//TODO: FAZER A LISTAGEM DE TODAS AS SUBSCRICOES!!!! ESTA UMA PARTE JA MEIA FEITA NO NOTEPAD++
async function subscricoesDoCanal(canal, numerodeSubs = 10){
    numerodeSubs = numerodeSubs.toString();
    var i = 1;
    var pedido
    if(numerodeSubs>50)
        numerodeSubs = 50
    try{
        pedido = await youtube.subscriptions.list({"part": ["snippet"],"channelId": [canal],"maxResults":numerodeSubs})
    }catch(e){
        i = -1
        pedido = e;
    }finally{
         // nunca vai fazer reject
    }
    return [pedido,i];
}

async function subsCanalPAginasTodas(canal){
    //var canal = "UCb7REoDeP1Du9MImqDuA0pA"
    var pagSeg;
    var arrayCanais = new Array()
    var pedido, i, isprimeiro = true;
    i = 0;
    var total;
    try{
        var totalResults =50;
        while(totalResults>=00){
            
            if(isprimeiro)
            {
                isprimeiro = false
                pedido = await youtube.subscriptions.list({"part": ["snippet"],"channelId": canal,"maxResults":"50","order":"alphabetical"})
                totalResults = parseInt(pedido.data.pageInfo.totalResults) - 50
                total = pedido.data.pageInfo.totalResults
            }else{
                pedido = await youtube.subscriptions.list({"part": ["snippet"],"channelId": canal,"maxResults":"50","order":"alphabetical", "pageToken": pagSeg})
                totalResults = totalResults -50
            }
            arrayCanais[i] = pedido
            pagSeg = pedido.data.nextPageToken
            i++
        }
    }catch(e){
        console.log(e,"erro")
        return [e,-1];
    }

    var arraytitulos = new Array()
    for(var a = 0;a<arrayCanais.length;a++){
        let c = arraytitulos.length
        for(var b = 0;b<arrayCanais[a].data.items.length;b++)
            {
                arraytitulos[b+c] = arrayCanais[a].data.items[b].snippet.title
            }
    }
    arraytitulos.sort(function(a, b){
        if(a < b) { return -1; }
        if(a> b) { return 1; }
        return 0;
    })
    return [arraytitulos,1];  
}


var Twitterclient = new twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token: TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
    timeout_ms: 60*1000
}); // login twitter
var idBot = '586601655244685318';
var idCanalPing = '802241972168687647';

async function musicastxt(){ //"musicastxt"

    let canal = "UCb7REoDeP1Du9MImqDuA0pA"
    let playlist = "https://www.youtube.com/playlist?list=PLyLyJwftT08W8EFfE9sY7IvyJAGNLCd5t"
    let opcoes ={
        playlistId: "PLyLyJwftT08W8EFfE9sY7IvyJAGNLCd5t",
        part: "snippet",
        maxResults:50
    }
    try{
        let token
        let nomeFich = "musicastxtYT.txt"
        let pedido = await youtube.playlistItems.list(opcoes).then(function(res){
            //console.log(res)
            token = res.data.nextPageToken
            for(let i =0; i<50;i++){
                //console.log(res.data.items[i].snippet.title + " canal: " + res.data.items[i].snippet.videoOwnerChannelTitle)
                let nome = res.data.items[i].snippet.title + " canal: " + res.data.items[i].snippet.videoOwnerChannelTitle + "\n"
                fs.appendFile(nomeFich,nome, function(err,data){if(err) {console.log(err)}})
            }
        })
        while(token){
            opcoes.pageToken = token
            pedido = await youtube.playlistItems.list(opcoes).then(function(res){
                //console.log(res)
                token = res.data.nextPageToken
                for(let i =0; i<50;i++){
                    
                    //console.log(res.data.items[i].snippet.title + " canal: " + res.data.items[i].snippet.videoOwnerChannelTitle)
                    let nome = res.data.items[i].snippet.title + " canal: " + res.data.items[i].snippet.videoOwnerChannelTitle + "\n"
                    fs.appendFile(nomeFich,nome, function(err,data){if(err) {console.log(err)}})
                }
            })
        }
        
    }catch(e){
            console.log("erro", e)
    }
}

var jaEnviouAntes=false;
myBot.on('message',message =>{
    /* spammar
    var mensagem = message.content;
    mensagem.toLowerCase();
    if(mensagem === 'gg')
    {
        message.channel.send("gg");
    }*/
    //console.log(message.author.id, message.content.toString())

    if((message.author.id == idBot) &&(message.channel.id == idCanalPing) )
    {
        message.delete();
        return;
    }

    if(message.author.bot)
        return;
    var mensagem = message.content.toString();
    var mensagemComCapitalizacaoNormal = mensagem
    mensagem = mensagem.toLowerCase();
    
    if(mensagem === "musicastxt"){
        musicastxt()
        return
    }

    if(mensagem.startsWith(`${prefix}allsubs`) ||mensagem.startsWith(`${prefix} allsubs`)){
        let mens =mensagemComCapitalizacaoNormal
        mens = mensagemComCapitalizacaoNormal.split(" ");
        if(mens[1] == "subsall")
        {
            subsCanalPAginasTodas(mens[1]).then(function(resolve){
                if(resolve[1] == 1){
                    for(var a = 0;a<resolve[0].length;a++){
                        let arr = new Array()
                        arr[a % 10] = resolve[0][a]
                        if(arr.length == 10)
                        {
                            message.channel.send(arr)
                            arr.splice(0,arr.length)
                        }
                    }
                }else{
                    message.channel.send("Algo inserido erroneamente");message.channel.send("utilizacao do comando: " + `${prefix} allsubs`+ " <idCanal>");
                }
            },function(err){
                if(err[1] == -1)
                {
                    message.channel.send("Algo inserido erroneamente");
                    message.channel.send("utilizacao do comando: " + `${prefix} allsubs`+ " <idCanal>");
                }else{
                    message.channel.send("Algo de errado aconteceu 🙏 amen");
                }
            })
        }
        else{
            subsCanalPAginasTodas(mens[2]).then(function(resolve){
                if(resolve[1] == 1){
                    for(var a = 0;a<resolve[0].length;a++){
                        let arr = new Array()
                        arr[a % 10] = resolve[0][a]
                        if(arr.length == 10)
                        {
                            message.channel.send(arr)
                            arr.splice(0,arr.length)
                        }
                    }
                }else{
                    message.channel.send("Algo inserido erroneamente");message.channel.send("utilizacao do comando: " + `${prefix} subsall`+ " <idCanal>");
                }
            },function(err){
                if(err[1] == -1)
                {
                    message.channel.send("Algo inserido erroneamente");
                    message.channel.send("utilizacao do comando: " + `${prefix} subsall`+ " <idCanal>");
                }else{
                    message.channel.send("Algo de errado aconteceu 🙏 amen");
                }
            })
        }
        return;
    }

    if(mensagem.startsWith(`${prefix}subs`) ||mensagem.startsWith(`${prefix} subs`)){
        let mens = mensagemComCapitalizacaoNormal
        
        let i = 2;
        if(mensagem.length ===`${prefix}subs`.length || mensagem.length ===`${prefix} subs`.length )
        {
            message.channel.send("utilizacao do comando: " + `${prefix} subs`+ " <idCanal> <numeroDeSubs (opcional)>");
            return;
        }
        mens = mensagemComCapitalizacaoNormal.split(" ");
        
        if(mens[0] == `${prefix}`){
            i++; //este i é para saber os args da mensagem, se a mensagem for "${prefix}subs", i = 1 se nao i = 2 que é quando vao comecar os args
        }
        //console.log( mens[2],mens[3],i == (mens.length-1), mens[i], mens[i-1])
        

        if(i != (mens.length-1))
        {
            subscricoesDoCanal(mens[i-1],mens[i]).then(function(resolve){
                if(resolve[1] == -1)
                {
                    message.channel.send("Algo inserido erroneamente -> "+resolve[0].response.data.error.message);
                    message.channel.send("utilizacao do comando: " + `${prefix} subs`+ " <idCanal> <numeroDeSubs (opcional)>");
                }else{
                    let canais = new Array();
                    for(var a = 0; a <resolve[0].data.items.length;a++)
                    {
                        canais[a] = resolve[0].data.items[a].snippet.title
                    }
                    canais.sort();
                    message.channel.send(canais)
                }
            },function(reject){
                console.log(reject,"reject")
            })
        
        }
        else {
            subscricoesDoCanal(mens[i-1]).then(function(resolve){
                if(resolve[1] == -1)
                {
                    message.channel.send("Algo inserido erroneamente -> "+resolve[0].response.data.error.message);
                    message.channel.send("utilizacao do comando: " + `${prefix} subs`+ " <idCanal> <numeroDeSubs (opcional)>");
                }else{
                    let canais = new Array();
                    for(var a = 0; a <resolve[0].data.items.length;a++)
                    {
                        canais[a] = resolve[0].data.items[a].snippet.title
                    }
                    canais.sort();
                    message.channel.send(canais)
                }
            },function(reject){
                console.log(reject,"reject")
            })
            


        }
        //message.channel.send(typeof(canais))
            //if(canais)
        //{
        //    console.log(canais)
        //    message.channel.send("Algo errado ->", canais)
        //}else{
        //    //parse das listas
        //}
        return;    
    }


    if(mensagem === 'gg'){
        if(jaEnviouAntes === false){
            message.channel.send("gg");
            jaEnviouAntes = true;
        }else{
            jaEnviouAntes = false;
        }
        return;
    }
    
    if (mensagem.startsWith(`${prefix}`)&& (mensagem.includes("foto de perfil") || mensagem.includes("avatar") || mensagem.includes("pfp"))) {
        //Send the user's avatar URL
        if((mensagem.length ===`${prefix}foto de perfil`.length) ||(mensagem.length ===`${prefix}avatar`.length)||(mensagem.length ===`${prefix}pfp`.length))
            {
                message.channel.send("falta o utilizador");
            }
            else{
                const utilizadorPingado = message.mentions.users.first();
                message.channel.send(utilizadorPingado.displayAvatarURL());                   
            }
            return;  
    }

    if((mensagem.includes("lets") && mensagem.includes("go"))|| (mensagem.includes("let's") && mensagem.includes("go")))
    {
        message.channel.send("https://64.media.tumblr.com/cdff5ebf86bd4027c164ea911ff12c38/68d632cb07902a7f-b5/s400x600/2d2d7b1d6559a4e1890138c7952f08a84774502e.png");
        return;
    }

    if(message.mentions.has(myBot.user) && !(mensagem.startsWith(`${prefix}`)&& (mensagem.includes("foto de perfil") || mensagem.includes("avatar") || mensagem.includes("pfp"))== true))
    {
        message.channel.send("nao me voltes a dar ping se nao parto te a boca toda :rage:",{tts: true});
        return;
    }

    if(message.toString().includes("pog")){
        message.channel.send("https://emoji.gg/assets/emoji/9154_PogU.png");
        return;
    }

    if(mensagem.startsWith(`${prefix}ping`)||mensagem.startsWith(`${prefix} ping`)){
        if(mensagem.length ===`${prefix}ping`.length)
        {
            message.channel.send("falta o utilizador");
        }
        else{
            const utilizadorPingado = message.mentions.users.first();
            for(var i =0;i<15;i++)
                message.channel.send(`${utilizadorPingado}`+ " pingado");
        }
        return;
    }
    
    if(mensagem.includes("sus") || mensagem.includes("impostor")){
		message.channel.send("https://cdn.discordapp.com/attachments/556495723336564744/794658710907125820/mqdefault.png");
        return;
    }	

    if(mensagem.startsWith(`${prefix}cat`) ||mensagem.startsWith(`${prefix}gato`) || mensagem.startsWith(`${prefix}gatos`)||mensagem.startsWith(`${prefix}cats`) ||mensagem.startsWith(`${prefix} cats`) ||mensagem.startsWith(`${prefix} cat`) ||mensagem.startsWith(`${prefix} gato`) || mensagem.startsWith(`${prefix} gatos`)){
        randomPuppy('cats').then(url => {
        message.channel.send(url);
    })
        return;
    }
	
	if(mensagem.includes("xiu bot") || mensagem.includes(`${prefix}xiu`) || mensagem.includes(`${prefix} xiu`) || (message.mentions.has(myBot.user) && mensagem.includes("xiu"))){
		//meter a dar ghost ping a pessoa que me mandou calar durante x segundos
		var util = message.author;
        message.channel.send("ok mano :pensive:");
        var canal;
        myBot.channels.fetch(idCanalPing).then(channel => channel.send(`${util}`)).catch();

        
        //canal.send(util);
        
        //message.delete()
        //    .then(msg => console.log(`Deleted message from ${msg.author.username} after 5 seconds`))
        //    .catch(console.error);
        /*
        var currentTime = new Date().getTime(); //nao se deve fazer assim pq é poop
           
        while (currentTime + 30000 >= new Date().getTime()) {
            if(currentTime % 12 == 0)
                {
                    var me = new Discord.Message()
                    message.channel.send(util);
                    message.delete();  
                }
   		}*/
        return;
	} 
	
    if(mensagem.includes("boas pessoal voces sabem quem fala") || mensagem.includes("boas pessoal vocês sabem quem fala"))
    {
        message.channel.send("Daqui é o Tiagovski a rebentar a escala\nMinecraft eu gosto de jogar!\nCom os meus episódios vos animar!\nÁters seus filhos da puta\nVocês devem ter memória curta\nNão se lembram de eu vos dizer?\nIdes pro caralho vão se fuder!\nAntes gostavam de mim mas agora não\nInveja é lixada pois é irmão\nOs meus subs tão no coração\nOs Áters eu desfaço com a mão\nMinecraft eu sei jogar\nMas vocês nem isso sabem apreciar\nCritiquem á vontade dêem a opinião\nMas dar dislike é a vossa profissão\nSó fazem isso para ter reputação\nQuando fazem videos daquele lucifrão\nMas agora falo dos meus amores\nQue são os meus subscritores\nVocês conhecem os meus parceiros\nAqueles gajos mesmo porreiros\nTemos a agda sempre a dizer\nPor favor Tiago não quero morrer!\nDepois vem a kika a falar\nO problema e que ela não se sabe calar\nO clipe é o porco bem maroto\nMas ele vale bem mais que um escroto\nO LegendBoy é um rico selo\nMas só porque ele tem cabelo\nA musica foi pequena mas de bom agrado\nAgora vou gravar fica ai agarrado!\nVá pessoal fiquem bem\nPorque sou eu quem vos entretém\nVá, vou bazar\nPorque esta me a apetecer jogar!\nFUI");
        return;
    }

    if(mensagem.startsWith(`${prefix}meme`) ||mensagem.startsWith(`${prefix} meme`))
    {
       
            setTimeout(function(){ 
            var databases;
            try{
                const dataJSON = jsonFich.readFileSync("PostRedditJson.json");
                databases = JSON.parse(dataJSON);
            } catch(err){
                console.log(`Error reading file from disk: ${err}`);
            }
            var strJason= JSON.stringify(databases);
            var res = strJason.split(",");
            var titulo = res[0];
            var url = res[1];
            var isvideo = res[2];
            var mensagemMedia;
            if(isvideo.includes("true")){
                titulo = titulo.split(":");
                //url = url.split(":");
                //vidUrl = vidUrl.split(":");
                mensagemMedia = "Titulo: " + titulo[1] + url;
                message.channel.send(new Discord.MessageAttachment("videofinal.mp4","videofinal.mp4")).catch(console.error);
            }else{
                titulo = titulo.split(":");
                //url = url.split(":");
                //imgUrl = imgUrl.split(":");
                mensagemMedia = "Titulo: " + titulo[1] +url;
                message.channel.send(new Discord.MessageAttachment("imagem.png","imagem.png")).catch(console.error);
            }
            message.channel.send(mensagemMedia);

            }, 15000);
            message.channel.send("espere 15 segundos. o seu meme esta a ser preparado 👨‍🍳");
            PythonShell.run('reddit.py', null, function (err) {
                if (err) throw err;
                
                }).catch(err => console.error(err));
            
            

        return;
    }
    
    if(mensagem.startsWith(`${prefix}tweet`) ||mensagem.startsWith(`${prefix} tweet`))
    {
        var sim = mensagem.startsWith(`${prefix}tweet`);var tweet;
        if(mensagem.length ===`${prefix}tweet`.length || mensagem.length ===`${prefix} tweet`.length )
        {
            message.channel.send("falta o tweet");
        }else{
            if(sim)
            {
                tweet = mensagem.toString().substring(8);
            }else{
                tweet = mensagem.toString().substring(9);
            }
            Twitterclient.post('statuses/update', { status: tweet }, function(err, datatweet, responsetwitter) {
                if(err)
                {
                    console.log(err);
                }
                else{
                    var params = {screen_name: 'ilikeverypeidos', count: 1};
                    Twitterclient.get('statuses/user_timeline', params, function(error, tweets, response) {
                        if (!error) {
                            var tweetLink = tweets[0].source.toString().split('"');
                            message.channel.send(tweetLink[1]+"status/"+tweets[0].id_str);
                        }
                    });
                }
            });
            
        }
    }
    /*
    if(mensagem.startsWith(`${prefix}nasa`) ||mensagem.startsWith(`${prefix} nasa`)){
        var dataMensagemNasa = new Date();
        var ano = dataMensagemNasa.getFullYear() - 2000;
        dataMensagemNasa = ano.toString() + dataMensagemNasa.getMonth().toString() + dataMensagemNasa.getDate().toString();
        var linkNasa = "https://apod.nasa.gov/apod/ap" + dataMensagemNasa +".html";
        fetch(linkNasa).catch(err => console.error(err)).then(res => message.channel.send(res));
        
        //ImagemNasa(dataMensagemNasa,linkNasa);
    }*/
    if(mensagem.startsWith("😭") && mensagem.endsWith("😭")){
        message.channel.send({
  files: [{
    attachment: 'gonnacry.mp4',
    name: 'gonnacry.mp4'
  }]
})
  .then()
  .catch(console.error);        //mensagem.channel.send.setFile("video.mp4","video");
        return;
    }

    //TODO: fazer com que ele veja se uma certa porta tem o server do mine
    if(mensagem.startsWith(`${prefix}status`) ||mensagem.startsWith(`${prefix} status`)){
        let host = mensagem.slice(9,mensagem.length);
        let port = host.split(" ");
        host=port[1]
        port=port[2]
        //console.log("host:: "+host + "            port" + port)
        if(!port)
            port = "80"
        console.log("ip: "+host + " porta: "+port)
        //TODO: se a porta nao estiver aberta ele demora totil a dizer algo
        http.get({host:host,port:parseInt(port)},function(res){
            console.log("status: " + res.statusCode)
            if(res.statusCode == 200)
                message.channel.send("esta online");
            else message.channel.send("nao esta online");
        }).on('error',function(err){
            console.log(err);
                message.channel.send("Nao esta online o servidor")
        });
        return;
    }
    if(mensagem.startsWith(`${prefix}txtmeme`) ||mensagem.startsWith(`${prefix} txtmeme`)){
        let a = mensagem.split(" ");
        let i = 0;
        if(a[0] == `${prefix}txtmeme`)
        {}else{i++;}
        
        message.channel.send(":rage: AMHH - all my homies hate x meme");

    }

})





/*

client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if(mensagem.startsWith(`${prefix}meme`)){
        //TODO apanhar reddit post
        //https://discordjs.guide/additional-info/rest-api.html#skeleton-code  MAIS IMPORTATNE
        //https://www.reddit.com/r/okbuddyretard.json?sort=top&t=week

        //https://www.npmjs.com/package/reddit
    }

	// ...
});

*/


/*
function ImagemNasa(dataMensagem,linkNasa){
    var linkAPOD = "https://apod.nasa.gov/apod/ap" + dataMensagem +".html";
    //var linkAPOD = "http://www.example.com";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
      console.log(xmlHttp.status + " e " + xmlHttp.readyState);
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            {
              console.log(xmlHttp.responseText);
              linkNasa = xmlHttp.responseText;
            }
        else{ console.log("rip");}
        
    }
    xmlHttp.open("GET",linkAPOD,true); // se for true faz um request assincrono
    xmlHttp.send(null);
}
*/
myBot.login(token); //login discord