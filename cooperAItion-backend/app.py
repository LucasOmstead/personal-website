from flask import Flask, request, jsonify
import json 
from game import * #mainly train_simulated_annealing and successor
from players import * #all player types

app = Flask(__name__)

# No CORS or rate limiting needed with nginx proxy

@app.route('/index')
def home():
    return "Hello, world!"

@app.route('/get_model', methods=["POST"])
def get_players():
    j = request.get_json()
    players = j["players"]
    payoffs = j["payoffs"]
    # print(players)
    models = []
    #Ugly code but it's ok
    for i in range(players['Tit For Tat']):
        models.append(TitForTat())
    for i in range(players['Grim Trigger']):
        models.append(GrimTrigger())
    for i in range(players['Two Tit For Tat']):
        models.append(TwoTitForTat())
    for i in range(players['Cooperative Tit For Tat']):
        models.append(CooperativeTitForTat())
    for i in range(players['Always Cooperate']):
        models.append(Cooperator())
    for i in range(players['Always Defect']):
        models.append(Defector())
    for i in range(players['Suspicious Tit For Tat']):
        models.append(SuspiciousTitForTat())
    
     
    model, perf = train_simulated_annealing(numRestarts=5, temperature=100, successor=successor, models=models, payoffs=payoffs, memSize=149)
    # print(models)
    print(bin(model))
    # print(perf)
    return {"model": bin(model)[2:]}

@app.route('/getmodel')
def get_model():
    # This endpoint appears to be unused/broken - disable it
    return {"error": "This endpoint is deprecated"}, 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
