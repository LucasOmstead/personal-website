**CooperAItion**

To set up, git clone the repository. On windows, run:  
`python -m venv venv`  
`venv/Scripts/activate`  
`pip install -r requirements.txt`  

game.py contains the optimization algorithm logic.  
find_genetic_beam.py and find_hill_annealing_tabu.py create and test many models with different configurations and write the results to several csv files.

If using it as a backend for cooperAItion-frontend, run `flask run --reload`

Otherwise, to run the different types of models, run `python game.py`.