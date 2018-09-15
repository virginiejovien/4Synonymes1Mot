Auteur du projet: 
- Virginie Jovien
Projet Back-End : Jeu multi-joueurs : 4 Synonymes pour 1 Mot 

1) Procédure d'installation avant le lancement du jeu

Pour récupérer un clone du projet "4Synonymes1Mot":
$ git clone https:/github.com/virginiejovien/4Synonymes1Mot

Ci-dessous les installations globales à faire : 
   - "npm"
   - "nodejs" 
   - "expressjs"
   - "mongodb" (installer mongoDB depuis cette adresse: https://www.mongoDB.org/downloads)

Ci-dessous les installations locales à faire : 
   - $ cd ~/4Synonymes1Mot"
   - $ npm init -y                   // Va créer le package.json du projet "4Synonymes1Mot" et l'arborescence technique                                       et liste les node_modules, le fichier JSON des dépendances ...
   - $ npm install mongodb --save     // Cette commande installe le module d'interface avec MongoDB
   - $ npm install express --save     // Cette commande installe le module Express.JS
   - $ npm install socket.io --save   // Cette commande installe le module Client-Serveur "socket.io"
   - $ npm install pug --save         // Cette commande installe le moteur de template "Pug"

En dessous du répertoire ": ~/4Synonymes1Mot"   on devrait avoir l'arborescence suivante :

  4Synonymes1Mot 
   |-- node_modules    // modules de nodes.js nécéssaires pour le projet "4Synonymes1Mot"
   |-- data           // Stockage de la base de données "jeu" (collection "joueur" et collection "question")
   |     |- jeu
   |         |- joueur       // collection "joueur"
   |         |- question     // collection  "question"
   |        
   |-- assets         // Ressources côté client
   |    |- css        // Stockage des fichiers ".css"
   |    |- images     // Stockage des images
   |    |- js         // Stockage des scripts Javascripts ".js"
   |       
   |-- views          // Stockage des templates "Pug"
   |-- .gitignore
   |-- db.js
   |-- DIW JS - Atelier back.pdf
   |-- index.html   
   |-- lancer-mongo.bat
   |-- package-lock.json
   |-- package.json 
   |-- README.md
   |-- serveur-jeu.js // serveur  du jeu 
   

2) Procédure de lancement du jeu 
  - lancer la BBD:
        1: lancer mongodb en executant: lancer-jeu-mongo.bat (à placer sur le bureau et à exécuter)
        2: puis se placer sur la base de données jeu : use jeu
        3: mongoimport --db jeu --collection question --file ~/4Synonymes1Mot/data/question.json
        (3' si pb dans l'importation du fichier JSON) copier le contenu du fichier : bdd_jeu_questions.js qui se trouve  dans le repertoire data :  ~/4Synonymes1Mot/data/bdd_jeu_questions.js (tous les insert de la collection question)
        Dans la BDD jeu dans les lignes de commandes de mongodb apres use jeu :::> coller le db.question.insertMany([{.....}]);

        La base de données jeu a actuellemnt une collection "question", à la premiere exexution du jeu "4Synonymes1Mot", lorsqu'un premier joueur s'inscrira correctement une deuxième collection "joueur" sera créée. 

        Rappel: Avant de lancer le serveur du jeu il est nécéssaire de se placer dur la BDD jeu, taper la commande suivante:
           - use jeu

  - lancer le serveur: serveur-jeu.js
       - $ cd ~/4Synonymes1Mot"
       - $ nodemon serveur-jeu.js

  - coté navigateur (Chrome, Firefox, Opera....)
 
        taper l'addresse suivante:  http://localhost:8000/

  A vous de JOUER!!!!!      
       





