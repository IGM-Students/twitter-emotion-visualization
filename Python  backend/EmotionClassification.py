from transformers import pipeline
import twint
import flask
import json
from json import JSONEncoder
from flask import Flask, request, Response
from cleantext import clean
import random
import uuid
import numpy as np
import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import sklearn
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
from flask_cors import CORS

if torch.cuda.is_available():
    device = torch.device('cuda')
else:
    device = torch.device('cpu')

model_name = "j-hartmann/emotion-english-distilroberta-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
model.to(device)
features = {}


def get_features(name):
    def hook(model, input, output):
        features[name] = output.detach()
    return hook


model.classifier.dense.register_forward_hook(get_features('feats'))


def Get_Twitts(hashtag, limit):
    config = twint.Config()
    config.Search = hashtag
    config.Limit = limit
    config.Lang = "en"
    config.Pandas = True
    config.Pandas_clean = True
    config.Hide_output = True
    twint.run.Search(config)
    tweetArray = twint.storage.panda.Tweets_df
    tweetArray = tweetArray[tweetArray.language == 'en']
    tweetArray = tweetArray[:limit]
    return tweetArray

def CreateMasterTwittList(hashtags, limit):
    masterTwittList = []
    for hashtag in hashtags:
        tweets = Get_Twitts(hashtag, limit)
        tweetList = tweets['tweet'].tolist()
        userList = tweets['username'].tolist()
        i =0
        for element in tweetList:
            masterTwittList.append(tweet(hashtag,userList[i], element, 0, 0))
            i+=1
    return masterTwittList

def Get_Features(twitts):
    PREDICTIONS = []
    FEATS = []
    for idx, inputs in enumerate(twitts):
        inputs = tokenizer(inputs, return_tensors="pt")
        inputs = inputs.to(device)

        predictions=model(**inputs).logits

        PREDICTIONS.append(predictions.detach().cpu().numpy())
        FEATS.append(features['feats'].cpu().numpy())
    return np.concatenate(FEATS)


def Get_PCA(features, nComponents):
    standarizedFeatures = StandardScaler().fit_transform(features[:,:])
    pca = PCA(n_components=nComponents)
    principalComponents = pca.fit_transform(standarizedFeatures)
    principalComponents = pd.DataFrame(data = principalComponents)
    scaler = MinMaxScaler(feature_range=(-1, 1))
    principalComponents = pd.DataFrame(data = scaler.fit_transform(principalComponents))
    return principalComponents

def Clasifficate(twitts, components):
    tweets = []
    for o in twitts:
        tweets.append(o['tweet'])
    resultsPd = Get_PCA(Get_Features(tweets), int(components))
    results = resultsPd.values.tolist()
    idx =  0
    for o in twitts:
        o['x'] = results[idx][0]
        o['y'] = results[idx][1]
        idx = idx + 1
    return twitts
    

def Get_EmotionClasiffication(twitts):
    classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=None)
    results = classifier(twitts)
    return results

class twittInfo(dict):
    def __init__(self, user, twitt, clasiffication):
        dict.__init__(self, user=user, twitt=twitt, clasiffication=clasiffication)

class hashtagClass(dict):
    def __init__(self, id, title, color, tweets):
        dict.__init__(self, id=id, title = title, color = color, tweets = tweets)

class tweet(dict):
    def __init__(self, hashtag, user, tweet, x, y):
        dict.__init__(self, hashtag=hashtag, user=user, tweet=tweet, x=x, y=y)

def DeEmojify(emojiList):
    for o in emojiList:
        o['tweet'] = clean(o['tweet'], no_emoji=True, no_urls=True)
    return emojiList

def JsonToList(jsonList):
    list = []
    for value in jsonList['hashtag']:
        list.append(str(value))
    return list


app = Flask(__name__)
CORS(app)


@app.route('/twitts', methods=['GET'])
def twitts():
    hashtag = request.args.get('hashtag')
    limit = request.args.get('limit')
    components = request.args.get('components')
    color = "#"+''.join([random.choice('0123456789ABCDEF') for j in range(6)])
    twitts = Get_Twitts(hashtag, limit)
    twittList = DeEmojify(twitts['tweet'].tolist())
    userList = twitts['username'].tolist()
    idList = twitts['id'].tolist()
    resultsPd = Get_PCA(Get_Features(twittList), int(components))
    results = resultsPd.values.tolist()
    twittJson = []
    for i in range(len(results)):
        twittJson.append(twittInfo(userList[i], twittList[i], results[i]))
    hasthagJson = hashtagClass(idList[1], hashtag, color, twittJson)
    response = json.dumps(hasthagJson, indent=4)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response



@app.route('/emotion', methods=['GET'])
def emotions():
    hashtag = request.args.get('hashtag')
    limit = request.args.get('limit')
    components = request.args.get('components')
    color = "#"+''.join([random.choice('0123456789ABCDEF') for j in range(6)])
    twitts = Get_Twitts(hashtag, limit)
    twittList = DeEmojify(twitts['tweet'].tolist())
    userList = twitts['username'].tolist()
    idList = twitts['id'].tolist()
    twittJson = []
    results = Get_Clasiffication(twittList)


@app.route('/hashtags', methods=['POST'])
def test():
    values = request.get_json()
    hashtags = JsonToList(values)
    limit = request.args.get('limit')
    createMasterTwittList = CreateMasterTwittList(hashtags, int(limit))
    twittList = DeEmojify(createMasterTwittList)
    tweets = Clasifficate(twittList, 2)
    hashtagClasses = []
    for hashtag in hashtags:
        results = list(filter(lambda item: item['hashtag'] == hashtag, tweets))
        color = "#"+''.join([random.choice('0123456789ABCDEF') for j in range(6)])
        hashtagClasses.append(hashtagClass(str(uuid.uuid4()), hashtag, color, results))

    return Response(json.dumps(hashtagClasses, cls=JSONEncoder,indent=4), mimetype='application/json')


app.run(debug=True)
