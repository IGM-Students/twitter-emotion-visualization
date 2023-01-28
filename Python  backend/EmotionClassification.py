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
from sklearn.preprocessing import StandardScaler, MinMaxScaler, Normalizer
from sklearn.decomposition import PCA
from flask_cors import CORS
import pickle

with open("models/pca_2_dim.pkl", 'rb') as pca_2_dim:
    pca_2D = pickle.load(pca_2_dim)

with open("models/pca_3_dim.pkl", 'rb') as pca_3_dim:
    pca_3D = pickle.load(pca_3_dim)

with open("models/pca_whiten_2_dim.pkl", 'rb') as pca_whiten_2_dim:
    whiten_pca_2D = pickle.load(pca_whiten_2_dim)

with open("models/pca_whiten_3_dim.pkl", 'rb') as pca_whiten_3_dim:
    whiten_pca_3D = pickle.load(pca_whiten_3_dim)

if torch.cuda.is_available():
    device = torch.device('cuda')
else:
    device = torch.device('cpu')

model_name = "j-hartmann/emotion-english-distilroberta-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
model.to(device)
features = {}
colors = ['#f032e6', '#ffe119', '#42d4f4', '#e6194B', '#469990', '#000075', '#f58231', '#bfef45', '#3cb44b', '#800000', '#9A6324',
'#4363d8', '#911eb4', '#a9a9a9', '#fabed4', '#ffd8b1', '#fffac8', '#aaffc3', '#dcbeff']


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

def LoadTweets(hashtags, limit, mahalanobisHashtag):
    masterTweetList = []
    for hashtag in hashtags:
        tweets = Get_Twitts(hashtag, limit)
        tweetList = tweets['tweet'].tolist()
        userList = tweets['username'].tolist()
        i =0
        for element in tweetList:
            masterTweetList.append(tweet(hashtag,userList[i], element, 0, 0, 0))
            i+=1
    mahalanobisTweets = list(filter(lambda item: item['hashtag'] == mahalanobisHashtag, masterTweetList))
    return masterTweetList, mahalanobisTweets

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


def CalculateMahalanobis(twitts, hashtag, components, pca, norm):
    tweets = []
    for o in twitts:
        tweets.append(o['tweet'])
    features = Get_Features(tweets)
    normal_transform = Normalizer(norm='l2').fit(features)
    normalizedFeatures = normal_transform.transform(features)
    df = pd.DataFrame(normalizedFeatures)
    data = df[list(range(0, 768))]

    y_mu = df - np.mean(data)
    cov = np.cov(data.values.T)
    inv_covmat = np.linalg.inv(cov)
    left = np.dot(y_mu, inv_covmat)
    mahal = np.dot(left, y_mu.T)
    df['CalculateMahalanobis'] = abs(mahal.diagonal())
    df = df.nlargest(5, ['CalculateMahalanobis'])
    df.drop(columns=['CalculateMahalanobis'])

    outTweets = []

    for i in df.index:
        outTweets.append(twitts[i])

    clasifficatedTweets = Clasifficate(outTweets, components, pca, norm)

    for tweet in clasifficatedTweets:
        tweet['hashtag'] = hashtag + '-outliers'
    return clasifficatedTweets


def Get_PCA(features, nComponents, pca, norm):
    normal_transform = Normalizer(norm='l2').fit(features)
    normalizedFeatures = normal_transform.transform(features)
    if nComponents == 2:
        if pca == 0:
            pca_transformer = pca_2D
        elif pca == 1:
            pca_transformer = whiten_pca_2D
    elif nComponents == 3:
        if pca == 0:
            pca_transformer = pca_3D
        elif pca == 1:
            pca_transformer = whiten_pca_3D
    principalComponents = pca_transformer.transform(normalizedFeatures)
    principalComponents = pd.DataFrame(data = principalComponents)
    if norm == 1:
        normal_transform_2 = Normalizer(norm='l2').fit(principalComponents)
        principalComponents = normal_transform_2.transform(principalComponents)
        principalComponents = pd.DataFrame(data = principalComponents)
    return principalComponents

def Clasifficate(twitts, components, pca, norm):
    tweets = []
    for o in twitts:
        tweets.append(o['tweet'])
    resultsPd = Get_PCA(Get_Features(tweets), components, pca, norm)
    results = resultsPd.values.tolist()
    idx =  0
    for o in twitts:
        o['x'] = results[idx][0]
        o['y'] = results[idx][1]
        o['z'] = results[idx][2]
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
    def __init__(self, hashtag, user, tweet, x, y, z):
        dict.__init__(self, hashtag=hashtag, user=user, tweet=tweet, x=x, y=y, z=z)

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
    pca = int(request.args.get('pca'))
    norm = int(request.args.get('norm'))
    mahalanobisHashtag = request.args.get('mahalanobisHashtag')
    loadedTweets, loadedMahalanobisTweets = LoadTweets(hashtags, int(limit), mahalanobisHashtag)
    tweetsList = DeEmojify(loadedTweets)
    mahalanobisTweets = DeEmojify(loadedMahalanobisTweets)
    tweets = Clasifficate(tweetsList, 3, pca, norm)
    CalculateMahalanobis(mahalanobisTweets, mahalanobisHashtag, 3, pca, norm)

    hashtags.append(mahalanobisHashtag + '-outliers')
    hashtagClasses = []
    col = 0
    for hashtag in hashtags:
        results = list(filter(lambda item: item['hashtag'] == hashtag, tweets))
        color = colors[col]
        hashtagClasses.append(hashtagClass(str(uuid.uuid4()), hashtag, color, results))
        col = col+1
    return Response(json.dumps(hashtagClasses, cls=JSONEncoder,indent=4), mimetype='application/json')

app.run(debug=True)