import praw
import random
import requests
import json
import urllib.request
import sys
import shutil #guardar imagem localmente
from urllib.request import urlretrieve
import ffmpeg
import subprocess
reddit = praw.Reddit(
    client_id="5ITCSCFrl5l3_w",
    client_secret="Wuz8wVFOx4od3kP0MtHpJ3-7OS52ew",
    user_agent="ImageGetter using PRAW to experiment with discord 0.0.0 by u/PeidosFTW"
)

i = random.randrange(1,20)
x=0

encontrouSubmissao = False

URLReddit = "https://www.reddit.com/r/okbuddyretard/comments/"

for submission in reddit.subreddit("okbuddyretard").hot(limit=20):
    x = x+1
    if(x == i):
        if(submission.clicked == True):
            i = random.range(1,20)
        else:
            URLImagem = URLReddit + submission.id + ".json"
            if(URLImagem == "https://www.reddit.com/r/okbuddyretard/comments/l0bfxz.json" or "https://www.reddit.com/r/okbuddyretard/comments/lkhj3i.json"):
                print("post canceroso")
            else:
                encontrouSubmissao = True
print("URLpost "+URLImagem)

if(encontrouSubmissao):
    
    response = requests.get(URLImagem,headers = {'User-agent': 'ImageGetter using PRAW to experiment with discord 0.0.0 by u/PeidosFTW'})
    ficheiroJSON = open("post.json","w")
    ficheiroJSON.write(response.text)
    with open('post.json') as f:
        data = json.load(f)
    #TODO nao esta a encontrar o "url_overridden_by_dest"    #print(data["dados"]["children"][0]["dados2"]) exemplo no postDoRedditExemplo.json
    #print(data[0]["data"]["children"][0]["data"]["url_overridden_by_dest"]) obter link da imagem/video no json
    imagemurl = data[0]["data"]["children"][0]["data"]["url_overridden_by_dest"]
    tituloPost = data[0]["data"]["children"][0]["data"]["title"]
    
    eVideo = False
    isVideoString = imagemurl.split(".")
    isVideoString = isVideoString[0]
    if isVideoString == "https://v":
        eVideo = True
        imagemurl = data[0]["data"]["children"][0]["data"]["secure_media"]["reddit_video"]["fallback_url"]
        nomeMedia = imagemurl.split("/")
        nomeMedia = nomeMedia[3]
        tipoFicheiro = ".mp4"
    else:
        nomeMedia = imagemurl.split("/")
        nomeMedia = nomeMedia[3]
        tipoFicheiro = nomeMedia.split(".")
        nomeMedia = nomeMedia[0]
        tipoFicheiro = "." + tipoFicheiro[1]
    
    ficheiroJSON.close()
    print("URLMedia "+imagemurl)
    if eVideo == False:
        imagemHTTP = requests.get(imagemurl, stream = True)
        
        if imagemHTTP.status_code == 200: #recebeu a oimagem
                imagemHTTP.raw.decode_content = True
                pathImagem = "imagem" + ".png"
                
                with open(pathImagem,"wb") as f:
                    shutil.copyfileobj(imagemHTTP.raw, f)
                mydict={
                    "title":tituloPost,
                    "url": URLReddit + submission.id,
                    "is_video":"false",
                    "image_url": URLImagem,
                    "video_url": "null"
                }
                with open('PostRedditJson.json', 'w') as json_file:
                    json.dump(mydict, json_file)
        else:
            print("nao recebeu nada")
            #nao recebeu a imagem
    else:
        video = "video.mp4"
        audio = "audio.mp3"
        #audioURL = imagemurl.split("/")
        #audioURL= audioURL[0] +"/" +"/" + audioURL[2] +"/" + audioURL[3] +"/"+ "audio"
        audioURL = imagemurl.split("_")
        audioURL= audioURL[0] + "_audio.mp4"
        try:
            videoHTTP = urlretrieve(imagemurl, video)
            audioHTTP = urlretrieve(audioURL,audio)
        except urllib.error.HTTPError:
            print("nao foi possivel extrair info ")
        except urllib.error.URLError:
            print("nao foi possivel extrair info 1")  
        else:
            stream = ffmpeg.input(video)
            streamaudio = ffmpeg.input(audio)
            ffmpeg.concat(stream,streamaudio,v=1,a=1).output(stream,streamaudio,"videofinal.mp4").run(overwrite_output=True)
            mydict={
                "title": tituloPost,
                "url": URLReddit + submission.id,
                "is_video":"true",
                "image_url": "null",
                "video_url": imagemurl
            }
            with open('PostRedditJson.json', 'w') as json_file:
                json.dump(mydict, json_file)
            #out = ffmpeg.output(stream,streamaudio, "videofinal.mp4").run_async(pipe_stdin=True) da erro com o .run* mas mesmo que nao de erro o ficheiro final nao existe ou se existe nao funciona
            #out = ffmpeg.output(stream,streamaudio, "videofinal.mp4", vcodec='mp4', acodec='mp3', strict='experimental',f="mp4",a=1)
            #out.run(overwrite_output=True)
            #TODO EXPORTAR PARA JSON O TITULO, AUTOR E UPDOOTS



