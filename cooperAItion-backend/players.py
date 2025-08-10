import random
class Player:
    def __init__(self):
        self.score = 0
        self.name = ""
    
    def get_action(self, past_moves, i):
        return 0 

class Defector(Player):
    def __init__(self):
        super().__init__()
        self.name = "Always Defect"
    
    def get_action(self, past_moves, i):
        return 1 

class Cooperator(Player):
    def __init__(self):
        super().__init__()
        self.name = "Always Cooperate"
    
    def get_action(self, past_moves, i):
        return 0
    
class GrimTrigger(Player):
    def __init__(self):
        super().__init__()
        self.name = "Grim Trigger"
    
    def get_action(self, past_moves, i):
        return 1 if 1 in past_moves[1] else 0

class RandomChooser(Player):
    def __init__(self):
        super().__init__()
        self.name = "Random Chooser"
    
    def get_action(self, past_moves, i):
        return random.choice((0, 1))

class TitForTat(Player):
    def __init__(self):
        super().__init__()
        self.name = "Tit For Tat"
    
    def get_action(self, past_moves, i):
        if i == 0:
            return 0
        return past_moves[1][i-1]

class TwoTitForTat(Player):
    def __init__(self):
        super().__init__()
        self.name = "Two Tit For Tat"
    
    def get_action(self, past_moves, i):
        if i < 2:
            return 0
        return 1 if (past_moves[1][i-1] == 1 and past_moves[1][i-2] == 1) else 0 

class NiceTitForTat(Player):
    def __init__(self):
        super().__init__()
        self.name = "Nice Tit For Tat"
    
    def get_action(self, past_moves, i):
        if i == 0 or past_moves[1].count(1) / i < .2:
            return 0 
        return 1
    
class SuspiciousTitForTat(Player):
    def __init__(self):
        super().__init__()
        self.name = "Suspicious Tit For Tat"
    
    def get_action(self, past_moves, i):
        if i == 0:
            return 1
        return past_moves[1][i-1]

class ModelPlayer149(Player):
    def __init__(self, model):
        super().__init__()
        self.name = "Sim Jim"
        self.model = model
    def get_model_move(self, past_moves, i):
        if i < 3:
            if i == 0:
                return (self.model >> 148) & 1
            if i  == 1:
                encoding = (past_moves[0][0]<<1) + (past_moves[1][0])
                return ((self.model >> 144) >> encoding) & 1
            if i == 2:
                encoding = (past_moves[0][i-1]<<3) + (past_moves[0][i-2]<<2) + (past_moves[1][i-1]<<1) + (past_moves[1][i-2])
                return ((self.model >> 128) >> encoding) & 1
        else: #i >= 3
            encoding = (int(1 in past_moves[1])<<6) + (past_moves[0][i-1]<<5) + (past_moves[0][i-2]<<4) + (past_moves[0][i-3]<<3) \
                        + (past_moves[1][i-1]<<2) + (past_moves[1][i-2]<<1) + past_moves[1][i-3]
            return (self.model >> encoding) & 1    
        
        
    def get_action(self, past_moves, i):
        return self.get_model_move(past_moves, i)
    

class ModelPlayer21(Player):
    def __init__(self, model):
        self.model = model
    def get_model_move(self, past_moves, i):
        if i < 2:
            if i == 0:
                return (self.model >> 20) & 1
            if i  == 1:
                # model[2* your move + opponent's move]
                # {(): 1, (0, 0): 1, (0, 1): 0, (1, 1): 0, (1, 0, 0, 0, 1, 1, 1): 0}
                encoding = (past_moves[0][0]<<1) + (past_moves[1][0])
                return ((self.model >> 16) >> encoding) & 1
        else:
            encoding = (past_moves[0][i-1]<<3) + (past_moves[0][i-2]<<2) \
                        + (past_moves[1][i-1]<<1) + (past_moves[1][i-2]<<0)
            return (self.model >> encoding) & 1    
        
        
    def get_action(self, past_moves, i):
        return self.get_model_move(past_moves, i)


class ModelPlayer85(Player):
    def __init__(self, model):
        self.model = model
    def get_model_move(self, past_moves, i):
        if i < 3:
            if i == 0:
                return (self.model >> 84) & 1
            if i  == 1:
                encoding = (past_moves[0][0]<<1) + (past_moves[1][0])
                return ((self.model >> 80) >> encoding) & 1
            if i == 2:
                encoding = (past_moves[0][i-1]<<3) + (past_moves[0][i-2]<<2) + (past_moves[1][i-1]<<1) + (past_moves[1][i-2])
                return ((self.model >> 64) >> encoding) & 1
        else:
            encoding = (past_moves[0][i-1]<<5) + (past_moves[0][i-2]<<4) + (past_moves[0][i-3]<<3) \
                        + (past_moves[1][i-1]<<2) + (past_moves[1][i-2]<<1) + past_moves[1][i-3]
            return (self.model >> encoding) & 1    
        
        
    def get_action(self, past_moves, i):
        return self.get_model_move(past_moves, i)
    

myModels = {
    21: ModelPlayer21,
    85: ModelPlayer85,
    149: ModelPlayer149
}
'''
bit string in the form: (2^0bits)(2^2bits)(2^4bits)(2^7bits) =  since your first move and opponents is acting as a selector
then we have 4 possibilites for you and 4 for opponent hence we have to select between 16

total = 149
'''