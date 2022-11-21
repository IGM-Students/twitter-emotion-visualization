from transformers import pipeline
import twint
import flask
import json
from json import JSONEncoder
from flask import Flask, request, Response
from cleantext import clean

import numpy as np
import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import sklearn
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA


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
    twint.run.Search(config)
    tweetArray = twint.storage.panda.Tweets_df
    tweetArray = tweetArray[tweetArray.language == 'en']
    return tweetArray


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


def Get_Clasiffication(twitts):
    classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=None)
    results = classifier(twitts)
    return results


class twittInfo(dict):
    def __init__(self, user, twitt, clasiffication):
        dict.__init__(self, user=user, twitt=twitt, clasiffication=clasiffication)


def DeEmojify(emojiList):
    for i in range(len(emojiList)):
        emojiList[i]= clean(emojiList[i], no_emoji=True, no_urls=True)
    return emojiList


app = Flask(__name__)


@app.route('/twitts', methods=['GET'])
def twitts():
    hashtag = request.args.get('hashtag')
    limit = request.args.get('limit')
    components = request.args.get('components')
    twitts = Get_Twitts(hashtag, limit)
    twittList = DeEmojify(twitts['tweet'].tolist())
    userList = twitts['username'].tolist()
    resultsPd = Get_PCA(Get_Features(twittList), int(components))
    results = resultsPd.values.tolist()
    twittJson = []
    for i in range(len(results)):
        twittJson.append(twittInfo(userList[i], twittList[i], results[i]))
    return json.dumps(twittJson, indent=4)


app.run(debug=True)
