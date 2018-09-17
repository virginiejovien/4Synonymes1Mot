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
   |-- Procfile
   |-- README.md
   |-- quatreSynonymesUnMot.js // serveur  du jeu 
   

2) Procédure de lancement du jeu 
      La base de données jeu est hébergé sur le site mLab

  - lancer le serveur: quatreSynonymesUnMot.js
       - $ cd ~/4Synonymes1Mot"
       - $ nodemon quatreSynonymesUnMot.js

  - coté navigateur (Chrome, Firefox, Opera....)
 
        taper l'addresse suivante: 
        https://quatre-synonymes-un-mot.herokuapp.com
        ou http://localhost:2000/

  A vous de JOUER!!!!!      
       





