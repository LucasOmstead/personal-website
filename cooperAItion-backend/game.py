#Stores most model training functions (apart from GA, hill climb, and simulated annealing)
import random
import time
from math import e, ceil
from players import Player, Defector, Cooperator, GrimTrigger, RandomChooser, TitForTat, TwoTitForTat, CooperativeTitForTat, SuspiciousTitForTat, myModels
#In general, past_moves[0] = your own moves, past_moves[1] = opponent's moves
#region LRUCache
class Node:
    def __init__(self, key: int, value: int):
        self.key = key
        self.value = value 
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.keyToNode = {}
        self.head = Node(-1, -1)
        self.tail = Node(-1, -1)
        self.join(self.head, self.tail)

    def get(self, key: int) -> int:
        if key not in self.keyToNode:
            return -1
        node = self.keyToNode[key]
        self.remove(node)
        self.moveToHead(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        if key in self.keyToNode:
            node = self.keyToNode[key]
            node.value = value
            self.remove(node)
            self.moveToHead(node)
            return

        if len(self.keyToNode) == self.capacity:
            lastNode = self.tail.prev
            del self.keyToNode[lastNode.key]
            self.remove(lastNode)

        self.moveToHead(Node(key, value))
        self.keyToNode[key] = self.head.next

    def join(self, node1: Node, node2: Node):
        node1.next = node2
        node2.prev = node1

    def moveToHead(self, node: Node):
        self.join(node, self.head.next)
        self.join(self.head, node)

    def remove(self, node: Node):
        self.join(node.prev, node.next)

        
def playGame(payoffs, player1: Player, player2: Player, numRounds: int):
    score1 = 0
    score2 = 0
    past_moves = [[-1 for i in range(numRounds)], [-1 for i in range(numRounds)]]
    for i in range(numRounds):
        action1 = player1.get_action(past_moves, i)
        action2 = player2.get_action(past_moves[::-1], i)
        past_moves[0][i] = action1
        past_moves[1][i] = action2 
        score1 += payoffs[action1][action2]
        score2 += payoffs[action2][action1]
    # print(player1, player2)
    return (score1/numRounds, score2/numRounds)

def calculateAllFitnesses(payoffs, models):
    #each player in the pool plays 1 game against each other
    scores = [0 for i in range(len(models))]
    
    for i in range(len(models)):
        for j in range(len(models)):
            score1, score2 = playGame(payoffs, models[i], models[j], 100)
            scores[i] += score1 
            scores[j] += score2 
    return scores

def calculateFitness(payoffs, models, modelPlayer):
    #each player in the pool plays 1 game against each other

    score = 0
    for i in range(len(models)):
        score1, score2 = playGame(payoffs, models[i], modelPlayer, 20)
        score += score2 
    score += playGame(payoffs, modelPlayer, modelPlayer, 10)[0]
    return score/(len(models)+1)

def successor(model, memSize):
    model = model ^ (1 << random.randint(0, memSize-1))
    return model

#First we'll use hill-climbing; should be easier to implement
def train_hill_climb(numRestarts: int, numIterations: int, successor, payoffs, memSize):
    models = [Defector(), Cooperator(), GrimTrigger(), TitForTat(), TwoTitForTat(), CooperativeTitForTat(), SuspiciousTitForTat()]

    bestModels = []
    ModelPlayer = myModels[memSize]
    numSuccessorsGenerated = memSize
    for _ in range(numRestarts): #number of random restarts. After 10 iterations we just return the best model so far
        curModel = random.getrandbits(memSize)
        
        #print(_)
        for _ in range(numIterations):
            successors = [(curModel, calculateFitness(payoffs, models, ModelPlayer(curModel)))]
            
            for _ in range(memSize):
                model = curModel ^ (1 << _)
                modelPlayer = ModelPlayer(model)

                fitness = calculateFitness(payoffs=payoffs, models=models, modelPlayer=modelPlayer)
                successors.append((model, fitness))
            
                
            # print(successors)
            
            successors.sort(reverse=True, key=lambda x: x[1])
            nextModels = [successors[i][0] for i in range(numSuccessorsGenerated)]
            nextWeights = [(successors[i][1]-successors[-1][1])**2 for i in range(numSuccessorsGenerated)]
        


            curModel = random.choices(nextModels, nextWeights)[0] if sum(nextWeights) != 0 else successors[0]
            # print(curModel)
            
        # print(bestModels)
        bestModels.append((curModel, calculateFitness(payoffs, models, ModelPlayer(curModel))))
    bestModels.sort(reverse=True, key=lambda x: x[1])
    return bestModels[0]

def train_hill_climb_tabu_restart(numRestarts: int, numIterations: int, successor, payoffs, memSize, tabuSize):
    
    #we'll be storing a vector of past 3 game states, and if the other guy has defected AT ALL (even previous to those three states)
    #128 total states once you've made it to >= 3 rounds
    #and then 2^4 states
    #and then 2^2 states
    #and then only 1 state at first
    #so first 128 bits are just the regular states, next 16 = i == 2, next 4 = i == 1, next 1 = i == 0
    #128 + 16 + 4 + 1 = 149 total bits
    
    #this is just a training set, we can swap it out with other models
    models = [Defector(), Cooperator(), GrimTrigger(), TitForTat(), TwoTitForTat(), CooperativeTitForTat(), SuspiciousTitForTat()]
    # models = [Cooperator(), Cooperator(), Cooperator()]

    bestModels = []
    ModelPlayer = myModels[memSize]
    numSuccessorsGenerated = 20
    visitedStates = LRUCache(tabuSize)
    for _ in range(numRestarts): #number of random restarts. After 10 iterations we just return the best model so far
        curModel = random.getrandbits(memSize)
        visitedStates.put(curModel, curModel)
        
        # print(_)
        for i in range(numIterations):

            successors = [(curModel, calculateFitness(payoffs, models, ModelPlayer(curModel)))]
            
            for _ in range(memSize):
                model = curModel ^ (1 << _)
                while model in visitedStates.keyToNode:
                    model = model ^ (1 << random.randint(0, 148))
                modelPlayer = ModelPlayer(model)

                fitness = calculateFitness(payoffs=payoffs, models=models, modelPlayer=modelPlayer)
                successors.append((model, fitness))
            
            
            successors.sort(reverse=True, key=lambda x: x[1])
            nextModels = [successors[i][0] for i in range(numSuccessorsGenerated)]
            nextWeights = [(successors[i][1]-successors[-1][1])**2 for i in range(numSuccessorsGenerated)]

            curModel = random.choices(nextModels, nextWeights)[0] if sum(nextWeights) != 0 else successors[0]
        
        bestModels.append((curModel, calculateFitness(payoffs, models, ModelPlayer(curModel))))
    bestModels.sort(reverse=True, key=lambda x: x[1])
    
    return bestModels[0]

def train_hill_climb_tabu(numIterations: int, successor, payoffs, memSize, tabuSize):
    """
    Perform tabu hill climbing without random restarts, tracking the globally best model.
    
    Parameters:
        numIterations (int): Number of iterations to run the search.
        successor (function): Function to generate a neighboring solution.
        payoffs (list): Payoff matrix.
        memSize (int): Size of the bit-string representing a solution.
        tabuSize (int): Maximum size of the tabu list.
        
    Returns:
        (bestModel, bestFitness): The best solution found and its fitness.
    """
    # Define evaluation models.
    models = [Defector(), Cooperator(), GrimTrigger(), TitForTat(), 
              TwoTitForTat(), CooperativeTitForTat(), SuspiciousTitForTat()]
    ModelPlayer = myModels[memSize]
    
    # Initialize tabu list and starting solution.
    visitedStates = LRUCache(tabuSize)
    curModel = random.getrandbits(memSize)
    visitedStates.put(curModel, curModel)
    
    # Track the best model seen so far.
    bestModel = curModel
    bestFitness = calculateFitness(payoffs, models, ModelPlayer(curModel))
    
    for _ in range(numIterations):
        # Evaluate the current solution and its successors.
        successors_list = [(curModel, calculateFitness(payoffs, models, ModelPlayer(curModel)))]
        
        for _ in range(2 * memSize):
            candidate = successor(curModel, memSize)
            # Ensure candidate is not tabu.
            while candidate in visitedStates.keyToNode:
                candidate = successor(candidate, memSize)
            candidateFitness = calculateFitness(payoffs, models, ModelPlayer(candidate))
            successors_list.append((candidate, candidateFitness))
        
        # Sort candidates by descending fitness.
        successors_list.sort(reverse=True, key=lambda x: x[1])
        # Choose the top memSize candidates and calculate weights.
        nextModels = [s[0] for s in successors_list[:memSize]]
        nextWeights = [(s[1] - successors_list[-1][1])**2 for s in successors_list[:memSize]]
        
        # Select the next current model probabilistically.
        curModel = random.choices(nextModels, nextWeights)[0]
        curFitness = calculateFitness(payoffs, models, ModelPlayer(curModel))
        visitedStates.put(curModel, curModel)
        # Update global best if needed.
        if curFitness > bestFitness:
            bestModel = curModel
            bestFitness = curFitness
            
    return bestModel, bestFitness


def train_simulated_annealing(numRestarts, temperature, successor, models, payoffs, memSize, coolingMul=.99):
    #generate a successor state. If better take it, otherwise don't
    curModel = random.getrandbits(memSize)

    bestGlobal = curModel 
    ModelPlayer = myModels[memSize]
    bestGlobalFitness = calculateFitness(payoffs, models, ModelPlayer(curModel))
    for _ in range(numRestarts):
        curModel = random.getrandbits(memSize)
        t = temperature
        while t > .1:
            
            nextModel = successor(curModel, memSize)
            curModelFitness = calculateFitness(payoffs, models, ModelPlayer(curModel))
            nextModelFitness = calculateFitness(payoffs, models, ModelPlayer(nextModel))

            if nextModelFitness > bestGlobalFitness:
                bestGlobal = nextModel 
                bestGlobalFitness = nextModelFitness
            if nextModelFitness >= curModelFitness:
                curModel = nextModel 
            else:
                probChoose = e**((nextModelFitness-curModelFitness)/t)
                curModel = random.choices([curModel, nextModel], [1-probChoose, probChoose])[0]
                #4 possibilities for the first move: CC, CD, DC, DD
                #1st move can have 4 possibilities, 2nd move can have 4 possibilities 4 x 4 = 16
            t *= coolingMul

    return (bestGlobal, calculateFitness(payoffs, models, ModelPlayer(bestGlobal)))


# function for training a model that plays the prisoners dilemma based on the basic genetic algorithm seen in class notes
# requires: initial population size of the algorithm, number of iterations for creating a new generation, amount of parents we
# want for the next generation to be created(percentForCrossover), payoffs are the scores for each action based on column row formatting
# models will be the basic models we created
def train_basic_genetic(initialPopulationSize, numIterations, percentForCrossover, models, payoffs, memSize):
    #randomly generated population
    population = [random.getrandbits(memSize) for _ in range(initialPopulationSize)]
    bestGlobal = None
    #calculate the # of successors we are going to be generating
    sizeForChoosing = max(ceil(initialPopulationSize*percentForCrossover), 2)
    ModelPlayer = myModels[memSize]

    for _ in range(numIterations):
        #calculate fitness for all generated models
        fitnessForAll = [(population[i], calculateFitness(payoffs, models, ModelPlayer(population[i]))) for i in range(len(population))]
        #sort based on the best fitnesses
        fitnessForAll.sort(reverse=True, key=lambda x: x[1])

        #update best model ever seen 
        bestGlobal = bestGlobal if bestGlobal is not None and bestGlobal[1] > fitnessForAll[0][1] else fitnessForAll[0]

        #choose top percent of the models
        topPercentFitness = fitnessForAll[:sizeForChoosing]
        
        #Calculate probability of those models being chosen
        sumOfTopPercent = sum(child[1] for child in topPercentFitness)
        probabilityForTopPercent = [child[1]/sumOfTopPercent for child in topPercentFitness]

        #generate a new population based on a random crossover point and 2 chosen parents 
        newPopulation = []
        for _ in range(initialPopulationSize):
            parents = random.choices(topPercentFitness, weights=probabilityForTopPercent, k=2)
            crossoverPoint = random.choices([i for i in range(1, memSize-1)], k=1)[0]
            newParent = ((parents[0][0] >> crossoverPoint) << crossoverPoint) + (parents[1][0] & (2**(crossoverPoint) - 1))

            newPopulation.append(newParent)
        
        population = newPopulation
    
    return bestGlobal
            
        

# function for training a model that plays the prisoners dilemma based on the basic genetic algorithm seen in class notes
# will try a random mutation with mutationCount number of times
def train_basic_genetic_mutation(initialPopulationSize, numIterations, percentForCrossover, mutationPercent, mutationCount, models, payoffs, memSize):
    #randomly generated population
    population = [random.getrandbits(memSize) for _ in range(initialPopulationSize)]
    bestGlobal = None
    #calculate the # of successors we are going to be generating
    sizeForChoosing = max(ceil(initialPopulationSize*percentForCrossover), 2)
    ModelPlayer = myModels[memSize]

    for _ in range(numIterations):
        #calculate fitness for all generated models
        fitnessForAll = [(population[i], calculateFitness(payoffs, models, ModelPlayer(population[i]))) for i in range(len(population))]
        #sort based on the best fitnesses
        fitnessForAll.sort(reverse=True, key=lambda x: x[1])

        #update best model ever seen 
        bestGlobal = bestGlobal if bestGlobal is not None and bestGlobal[1] > fitnessForAll[0][1] else fitnessForAll[0]

        #choose top percent of the models
        topPercentFitness = fitnessForAll[:sizeForChoosing]
        
        #Calculate probability of those models being chosen
        sumOfTopPercent = sum(child[1] for child in topPercentFitness)
        probabilityForTopPercent = [child[1]/sumOfTopPercent for child in topPercentFitness]

        #generate a new population based on a random crossover point and 2 chosen parents 
        newPopulation = []
        for _ in range(initialPopulationSize):
            parents = random.choices(topPercentFitness, weights=probabilityForTopPercent, k=2)
            crossoverPoint = random.choices([i for i in range(1, memSize-1)], k=1)[0]
            newParent = ((parents[0][0] >> crossoverPoint) << crossoverPoint) + (parents[1][0] & (2**(crossoverPoint) - 1))

            #mutates mutationCount number of times
            for _ in range(mutationCount):
                willMutate = random.choices([True, False], [mutationPercent, 1-mutationPercent])[0]

                if(willMutate):
                    mutationPoint = random.choices([i for i in range(0, memSize)], k=1)[0]
                    newParent = newParent ^ (1 << mutationPoint)

            newPopulation.append(newParent)

        population = newPopulation
    
    return bestGlobal

def local_beam_search(numIterations: int, k: int, successor, models, payoffs, memSize):
    kBestModels = []
    ModelPlayer = myModels[memSize]
    
    #generate k models to start search from 
    for _ in range(k):
        newModel = random.getrandbits(memSize)
        fitness = calculateFitness(payoffs=payoffs, models=models, modelPlayer=ModelPlayer(newModel))
        kBestModels.append((newModel, fitness))

    #take the best found
    kBestModels.sort(reverse=True, key=lambda x: x[1])
    bestModelFound = kBestModels[0]
    numSuccessors = memSize

    #number of times of expansion of the k best models
    for _ in range(numIterations):
        successors = []
        for currModel in kBestModels:
            
            for i in range(memSize):
                model = currModel[0] << i 
                # model = successor(currModel[0], memSize)

                modelPlayer = ModelPlayer(model)
                
                fitness = calculateFitness(payoffs=payoffs, models=models, modelPlayer=modelPlayer)
                successors.append((model, fitness))
        
        successors.sort(reverse=True, key=lambda x: x[1])
        kBestModels = [successors[i] for i in range(k)]
        bestModelFound = bestModelFound if bestModelFound[1] >= kBestModels[0][1] else kBestModels[0]
    
    return bestModelFound
            
cooperateReward = (5, 5)
betrayalReward = (8, 0)
betrayedReward = (0, 8)
bothBetray = (2, 2)
#payoffmatrix[player1choice][player2choice] = reward for player1, player2

payoffs = [[cooperateReward[0], betrayedReward[0]], 
             [betrayalReward[0], bothBetray[0]]]

payoffs2 = [[-1, -5], [0, -3]]
payoffs = [[3, 0], [5, 1]]
memorySize = 149
baseLineModels = [Defector(), Cooperator(), GrimTrigger(), TitForTat(), TwoTitForTat(), CooperativeTitForTat(), SuspiciousTitForTat()]


# print("Genetic model:")
# for i in (40, 80):
#     for _ in range(10):
#         annealing_model = train_hill_climb(1, i, successor, payoffs, 149)
#         # annealing_model = train_basic_genetic_mutation(5, 20, 1, .05, 5, baseLineModels, payoffs, 149)
#         models = [Defector(), Cooperator(), GrimTrigger(), TitForTat(), TwoTitForTat(), CooperativeTitForTat(), SuspiciousTitForTat()]
#         # print(bin(annealing_model[0]), annealing_model[1])
#         # print("Genetic model fitnesses:")
#         print(calculateFitness(payoffs, models, myModels[149](annealing_model[0])))
#         # print(calculateAllFitnesses(payoffs, models))


# (5, 5), (8, 0), (0, 8), (2, 2)
# payoffs[yourAction][hisAction] = yourPayoff
# 0 cooperate and 1 is defect
# (1,1), (0, 5), (5,0), (3,3)
# payoffs = [[1, 0], [5, 3]]
 
    
# print("Tabu search model: ")
# trained_bin_model, performance = train_hill_climb_tabu(40, successor, payoffs=payoffs, memSize=memorySize, tabuSize=30)
# trained_bin_model = bin(trained_bin_model)
# print(trained_bin_model, performance)
# print("Tabu search model fitnesses:")
# models = [Defector(), Cooperator(), GrimTrigger(), TitForTat(), TwoTitForTat(), CooperativeTitForTat(), SuspiciousTitForTat(), myModels[memorySize](int(trained_bin_model[2:], 2))]
# print(calculateAllFitnesses(payoffs, models))
# # print((trained_bin_model>>148)&1, (trained_bin_model>>144)&1, (trained_bin_model>>128)&1) #prints what happens with no defections - usually 0 0 0            

# print("Basic Genetic Model:")
# genetic_model = train_basic_genetic(15, 40, 0.1, [Defector(), Cooperator(), GrimTrigger(), TitForTat(), TwoTitForTat(), CooperativeTitForTat(), SuspiciousTitForTat()], payoffs=payoffs)
# models = [Defector(), Cooperator(), GrimTrigger(), TitForTat(), TwoTitForTat(), CooperativeTitForTat(), SuspiciousTitForTat(), ModelPlayer(genetic_model[0])]
# print(bin(genetic_model[0]), genetic_model[1])
# print("Basic Genetic Model Fitnesses:")
# print(calculateAllFitnesses(payoffs, models))

# print("Mutation Genetic Model:")
# genetic_model = train_basic_genetic_mutation(50, 30, 0.2, 0.1, 5, [Defector(), Cooperator(), GrimTrigger(), TitForTat(), TwoTitForTat(), CooperativeTitForTat(), SuspiciousTitForTat()], payoffs=payoffs)
# models = [Defector(), Cooperator(), GrimTrigger(), TitForTat(), TwoTitForTat(), CooperativeTitForTat(), SuspiciousTitForTat(), ModelPlayer(genetic_model[0])]
# print(bin(genetic_model[0]), genetic_model[1])
# print("Mutation Genetic Model Fitnesses:")
# print(calculateAllFitnesses(payoffs, models))

# print("Local Beam Model:")
# local_beam_model = local_beam_search(10, 5, successor=successor, models=[Defector(), Cooperator(), GrimTrigger(), TitForTat(), TwoTitForTat(), CooperativeTitForTat(), SuspiciousTitForTat()], payoffs=payoffs)
# models = [Defector(), Cooperator(), GrimTrigger(), TitForTat(), TwoTitForTat(), CooperativeTitForTat(), SuspiciousTitForTat(), ModelPlayer(local_beam_model[0])]
# print(bin(local_beam_model[0]), local_beam_model[1])
# print("Local Beam Model Fitnesses:")
# print(calculateAllFitnesses(payoffs, models))
