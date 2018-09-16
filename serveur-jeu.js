'use strict';

// ***************************************************************************************************************
//     PROJET N°2 BACK-END: JEU MULTI-JOUEURS
//              4 SYNONYMES POUR UN MOT
//     Auteur: Virginie Jovien
//     Juillet 2018
//     Règle du jeu: Trouver avant les autres joueurs le mot correspondant aux 4 synonymes affichés 
//                   le premier joueur connecté ayant rempli les prérequis de connection (renseigner un
//                   pseudonyme de joueur et qui ne devra pas être pris par un autre joueur) est le maître de jeu             
//**************************************************************************************************************** 
/***************************************************************************/
const mongodb = require('mongodb');
var dbInterface = require('./db');
const express =  require('express');
var app = express();
const SocketIo = require('socket.io');

// ***********************************************************************************************************
//Connection à mongoDB, on vérifie qu'elle est bien lancée et que la la base de données "JEU"
// est accessible, sinon, on envoie un message d'erreur à l'administrateur systhème et on termine le programme
//************************************************************************************************************ 
const verifDBConnect = function() {
    mongodb.MongoClient.connect('mongodb://virgo:jeu2018@ds257851.mlab.com:57851/jeu', function(err, db) {
        if (err) {
            console.log('La Base De Données est inaccessible, le jeu ne peut pas démarrer');
        throw "La Base De Données est inaccessible, le jeu ne peut pas démarrer, veuillez contacter l\'Administrateur Système";
        } else {
            client=db;
            console.log('La Base De Données JEU fonctionne');
        }
    });
};

// ************************************************************************************************
// Verification de l'accessibilité de la Base De Données :"JEU"- 
// Dans un contexte professionnelle je m'assurai que la BDD fonctionne à chaque requete mais
// dans le contexte du projet "jeu multi-joueur", je ne le fais qu'au debut du lancement du programme 
// et si elle ne fonctionne pas, j'envoie un message dans la console et je quitte le programme
// ************************************************************************************************
verifDBConnect();

//*************************************************************************************************
//  Préparation du fond d'écran, et récupération des scores des joueurs 
//  Requete des infos des scores des joueurs dans la collection "joueur" de la BDD JEU
//*************************************************************************************************

app.set('view engine', 'pug');
app.use('/static', express.static(__dirname + '/assets'));
app.get('/', function(req, res, next) {    
    dbInterface.connectDB(req,res,next,function(db) {            
        console.log('mongodb connected');
        const collection = db.collection('joueur');
        collection.find().toArray(function(err, data){
        if (err) {
            console.log('Erreur de collection');
            return;
        }
        console.log('data',data);  
        res.render('index', {joueur: data})  
        });
    });
});

// ***********************************************************************************************
//  Lancement du serveur NodeJS
// ***********************************************************************************************
const serverWeb = app.listen(process.env.PORT || 8000, function() {
    const portEcoute = serverWeb.address().port
    console.log('Écoute du serveur NodeJs sur le port %s',portEcoute);
});

//************************************************************************************************
// Déclaration des variables globales
//************************************************************************************************
const joueurs = 
{
    compteur:-1,
    max:false,
    parti: false,
    dateDebut :0,
    dateFin :0,
    joueur0:
    { 
        joueur:0,
        idConnect:'',
        username:'',
        avatar:'static/images/avatar0.png',
        score:0,
        dateDebut:0,
        dateFin:0,
        dernierTemps:0,
        rapidite:0,
        ready:false
    },
    joueur1:
    { 
        joueur:1,
        idConnect:'',
        username:'',
        avatar:'static/images/avatar1.png',
        score:0,
        dateDebut:0,
        dateFin:0,
        dernierTemps:0,
        rapidite:0,
        ready:false
    },
    joueur2:
    { 
        joueur:2,
        idConnect:'',
        username:'',
        avatar:'static/images/avatar2.png',
        score:0,
        dateDebut:0,
        dateFin:0,
        dernierTemps:0,
        rapidite:0,
        ready:false
    },
    joueur3:
    { 
        joueur:3,
        idConnect:'',
        username:'',
        avatar:'static/images/avatar3.png',
        score:0,
        dateDebut:0,
        dateFin:0,
        dernierTemps:0,
        rapidite:0,
        ready:false
    },
     joueur4:
    { 
        joueur:4,
        idConnect:'',
        username:'',
        avatar:'static/images/avatar4.png',
        score:0,
        dateDebut:0,
        dateFin:0,
        dernierTemps:0,
        rapidite:0,
        ready:false
    }
};

let connectes = {         // Joueurs en train de se connecter mais non encore validés
    compteur:-1,
    id:[]       
};

let objetQuestions = {};           // Collection des questions
let client = {};                    // instance de la base de données

//************************************************************************************************
// Controle du Nbre maxi de joueurs
//************************************************************************************************
let controleNbreMaxiPlayersIsOK = function(pWebsocketConnection,pObjetJoueur) {
    if ((joueurs.compteur >= 4) || (joueurs.max)){
        joueurs.max= true;
        let message = {};
        message.id = connectes.id[connectes.compteur]
        pObjetJoueur.username = '';
        message.message = 'le nombre de joueurs maxi atteint';
        pWebsocketConnection.emit('nbJoueurMax', message);
        return false;
    } else {
        return true;
    }
};  

//*************************************************************************************************************************************
// Controle si un joueur a quitté la partie: on n'autorise plus de nouveaux joueurs même si le nombre de joueurs maxi n'est pas atteint
//*************************************************************************************************************************************
let controlePartiPlayersIsOK = function(pWebsocketConnection,pObjetJoueur) {
    if ((joueurs.parti)){
        let message = {};
        message.id = connectes.id[connectes.compteur]
        pObjetJoueur.username = '';
        message.message = 'La partie a déjà commencé, revenez jouer plus tard!!!';
        pWebsocketConnection.emit('enCours', message);
        return false;
    } else {
        return true;
    }
};  

//************************************************************************************************
// Vérification de l'unicité du nom du joueur dans la partie
//************************************************************************************************
let sendAlreadyExistentPseudoMsg = function(pWebsocketConnection, pObjetJoueur) {
    let message = {};
    message.id = connectes.id[connectes.compteur];
    pObjetJoueur.username = '';
    message.message = 'Ce pseudo existe déjà';
    pWebsocketConnection.emit('message', message);
};

//************************************************************************************************
// Vérification que le pseudo du joueur est renseigné
// ***********************************************************************************************
let checkFilledPlayerNameIsOk = function(pObjetJoueur, pWebsocketConnection) {
    if (!pObjetJoueur.username) {
        let message = {};
        // message.id = connectes.id[connectes.compteur];
        pObjetJoueur.username = '';
        message.message = 'Vous devez saisir un Pseudo';
        pWebsocketConnection.emit('message', message);
        return false;
    } else {
        return true;
    }
};

//************************************************************************************************
// Préparation des données du nouveau joueur
// et insertion dans la base de données
// ************************************************************************************************
let prepareAndInsertNewPlayer = function(pObjetJoueur,pColJoueur) {
    pObjetJoueur.dateDebut= new Date().getTime();    
    joueurs['joueur'+joueurs.compteur].dateDebut = pObjetJoueur.dateDebut; 
    pObjetJoueur.dateFin = 0;
    pObjetJoueur.duree = 0;
    pObjetJoueur.dernierTemps = 0;  //dernier temps pour trouver la reponse
    pObjetJoueur.rapidite = joueurs['joueur'+joueurs.compteur].rapidite; //meilleur temps pour trouver la réponse                                                            
    joueurs['joueur'+joueurs.compteur].username= pObjetJoueur.username;
    pObjetJoueur.avatar = joueurs['joueur'+joueurs.compteur].avatar; 
    pObjetJoueur.joueur = joueurs['joueur'+joueurs.compteur].joueur; 
    pObjetJoueur.score = joueurs['joueur'+joueurs.compteur].score;   
    pColJoueur.insert(pObjetJoueur);
    pObjetJoueur.ready = joueurs['joueur'+joueurs.compteur].ready;
};

//************************************************************************************************
// calcul de la durée du temps passé à jouer du joueur qui quitte le jeu
// update dans la base de données dans la collection joueur
// ************************************************************************************************
let updateDureePlayer = function(pCurrentPlayer,pColJoueur) {
    let dateStop =  new Date().getTime();
    joueurs['joueur'+pCurrentPlayer].dateFin =  dateStop;
    let elapsedTime = joueurs['joueur'+pCurrentPlayer].dateFin - joueurs['joueur'+pCurrentPlayer].dateDebut;
    pColJoueur.update({username:joueurs['joueur'+pCurrentPlayer].username}, {$set:{duree:elapsedTime, dateFin:dateStop}});        
};                                                                   

//************************************************************************************************
// Obtention des questions dans la BDD et transmission de celles-ci à tout le monde
//************************************************************************************************
let getSeriesOfQuestions = function(pSocketIo) {
    let colQuestion = client.db('jeu').collection('question');           
    colQuestion.aggregate([ { $sample: { size: 1 } } ]).toArray(function(error, documents){
        if (! error) {  
            documents.forEach(function(objetQuestion){
                objetQuestions.synonyme = objetQuestion.synonyme;                  
            });
            joueurs.dateDebut = new Date().getTime();   
            pSocketIo.emit('question', documents);
        } 
    });
};

//************************************************************************************************
// Obtention des scores des joueurs la BDD et transmission de celles-ci à tout le monde
//************************************************************************************************
let getScores = function(pSocketIo) {
    let colScores = client.db('jeu').collection('joueur');           
    colScores.find().sort({score:-1, rapidite:1}).toArray(function(err, data){
        if (err) {
          console.log('Erreur de collection');
          return;
        }
        pSocketIo.emit('scores',  data);             
    });   
}; 
 
//************************************************************************************************
// JOUEUR PRET A JOUER 
//************************************************************************************************
let listenReady = function(pObjetJoueur, pWebsocketConnection) {
    pWebsocketConnection.on('ready', function (pObjetJoueur) {          
        joueurs['joueur'+pObjetJoueur.joueur].ready = true;
        pObjetJoueur.ready = joueurs['joueur'+pObjetJoueur.joueur].ready;
        pWebsocketConnection.emit('peutJouer', pObjetJoueur.ready);    
    });
};

//*****************************************************************************************************
// Préparation et MAJ du score, du temps pour trouver la bonne réponse et du nom du gagnant dans la BDD
//*****************************************************************************************************
let getGagnant = function(pObjetReponse) {
    let leScore;
    let gagnant;
    let rapidite = 0;
    let tempsEcoule = 0;
    joueurs['joueur'+pObjetReponse.joueur].score = joueurs['joueur'+pObjetReponse.joueur].score +1;
    leScore = joueurs['joueur'+pObjetReponse.joueur].score;
    gagnant = joueurs['joueur'+pObjetReponse.joueur].username;  // on récupère le pseudo du gagnant
    joueurs.dateFin =  new Date().getTime();          // on recupere la date pour calculer le temps écoulé 
    let t = joueurs.dateFin - joueurs.dateDebut;       // on calcule le temps mis pour trouvé la réponse
    tempsEcoule  = Math.floor(t / 1000) % 60; // temps passé à jouer en secondes 
      
    if ( joueurs['joueur'+pObjetReponse.joueur].rapidite === 0 ) { // si premier temps de rapidite on récupère le temps écoulé
        joueurs['joueur'+pObjetReponse.joueur].rapidite = tempsEcoule;  
        rapidite = tempsEcoule;
    }
    if ( joueurs['joueur'+pObjetReponse.joueur].rapidite > tempsEcoule ) { // on garde en mémoire le meilleur temps
        joueurs['joueur'+pObjetReponse.joueur].rapidite = tempsEcoule;  
        rapidite = tempsEcoule;

    } else {
        rapidite =  joueurs['joueur'+pObjetReponse.joueur].rapidite; // on garde en mémoire le meilleur temps
    }

    joueurs['joueur'+pObjetReponse.joueur].dernierTemps = tempsEcoule; // maj du meilleur  temps  dans l'objet du joueur
    
    mongodb.MongoClient.connect('mongodb://virgo:jeu2018@ds257851.mlab.com:57851/jeu', function(error, client) { // mise à jour de la collection joueur: score
        if (! error) {                
            let colJoueur = client.db('jeu').collection('joueur');
            colJoueur.update({username:gagnant}, {$set:{score:leScore, dernierTemps:tempsEcoule, rapidite:rapidite}});        
            console.log('update ok');
            colJoueur = client.db('jeu').collection('joueur');
            colJoueur.find({username:gagnant}).toArray(function(error, documents) {
                if (error) {
                    console.log('Erreur de collection avant update',error);
                }
            });
        } 
    });  
};

/*****************************************************************************************************/
/*************************  Partie Websocket du serveur  *********************************************/
/*****************************************************************************************************/
let socketIo = new SocketIo(serverWeb);

socketIo.on('connection', function(websocketConnection) {
    websocketConnection.emit('connexionServeurOK', {msg:'Connexion effectuée'});   
    console.log('Connexion établie');
    let objetJoueur = {};
    let currentPlayer = -1;
    websocketConnection.on('controle', function (data) {       // Reception de la saisie du Login dans le formulaire
        objetJoueur = data;
            
        if (controleNbreMaxiPlayersIsOK(websocketConnection,objetJoueur)) { // controle si le nbre de joueur maxi n'est pas atteint
            if (controlePartiPlayersIsOK(websocketConnection,objetJoueur)) {  // controle joueur parti donc parti déjà bien entammé donc partie encours   
                if (checkFilledPlayerNameIsOk(objetJoueur,websocketConnection)) {  // Si le nom du joueur est non vide --> Ok
                    // Vérification de l'unicité du nom du joueur dans la partie dans la collection joueur de la BDD JEU
                    let colJoueur = client.db('jeu').collection('joueur');
                    colJoueur.find({username:objetJoueur.username}).toArray(function(error, documents) {                    
                        if (error) {
                            console.log('Erreur de collection',error);
                            return false;
                        } else {                                
                            if (documents == false) {
                                // Nouveau joueur, inexistant dans la base --> Ok, On l accepte
                                joueurs.compteur++;                                   // Nbre de joueurs actuels autorisés et dernier joueur connecté  (Water Mark)
                                currentPlayer = joueurs.compteur;                     // Joueur courant de cette session-Connexion
                                prepareAndInsertNewPlayer(objetJoueur, colJoueur);    // Ecriture dans la BDD du nouveau joueur
                                socketIo.emit('pret', objetJoueur);
                                getScores(socketIo); // affichage du tableau des scores des joueurs qui ont déjà joué ou qui sont entrain de jouer et de leurs avatars pseudo scores et performances, durée de jeu
                                
                                websocketConnection.emit('EffaceFormulaire');        
                                    if (objetJoueur.joueur == 0) {             // Si c'est le 1er joueur connecté, il est le Maître de la partie
                                        getSeriesOfQuestions(socketIo);     // On va chercher les questions dans la BDD
                                    };            
                                    if (joueurs.compteur > 0) {   // Si le joueur qui vient d'être accepté N'EST PAS le 1er, MAJ sur tous les joueurs de ses infos
                                        for (var i=0; i<=joueurs.compteur-1;i++) {
                                            websocketConnection.emit('listeJoueur', joueurs['joueur'+i]);
                                        }                                        
                                    }                          
                            } else {                
                                sendAlreadyExistentPseudoMsg(websocketConnection, objetJoueur)
                            }
                        }
                    });                          
                }   // Le nom du joueur est vide gerer dans la fonction checkFilledPlayerNameIsOk     
            }  // // Le joueur qui se connecte ne peut pas jouer des joueurs ont déjà quiité la partie, c'est gerer dans la fonction controlePartiiPlayersIsOK             
        } // Le joueur qui se connecte ne peut pas jouer car le jeu est plein
                        // geré dans la fonction controleNbreMaxiPlayersIsOK               
    });          

    listenReady(objetJoueur,websocketConnection);   //joueur pret et obtention des questions

//*******************************************************************************************
// Partie jeu : gestion des questions, des reponses et des scores
//*******************************************************************************************  
    websocketConnection.on('reponse', function (data) {  
        let objetReponse = data;            // gestion des reponses des joueurs
          
        if (objetReponse.reponse === objetQuestions.synonyme) {   // est ce que c'est la bonne réponse?
            getGagnant(objetReponse);  // si oui mise a jour du gagant dans BBD  
            socketIo.emit('gagne', joueurs['joueur'+objetReponse.joueur]); // on envoie au front le joueur qui a gagné
            getScores(socketIo);    // MAJ du tableau des scores des joueurs on envoie au front le tableau des scores MAJ
            mongodb.MongoClient.connect('mongodb://virgo:jeu2018@ds257851.mlab.com:57851/jeu', function(error, client) { // obtention de la nouvelle série de questions
                 if (! error) {                
                    let colQuestion = client.db('jeu').collection('question');           
                    colQuestion.aggregate([ { $sample: { size: 1 } } ]).toArray(function(error, documents) {
                         if (! error) {  
                            documents.forEach(function(objetQuestion) { 
                                objetQuestions.synonyme = objetQuestion.synonyme;     // on récupére les questions et le synonyme à trouver               
                            });  
                            joueurs.dateDebut = new Date().getTime(); // on réinialise la date pour calculer le temps de réponse pour trouver la question   
                            getScores(socketIo); // MAJ du tableau des scores des joueurs on envoie au front le tableau des scores MAJ    
                            socketIo.emit('question', documents)  // on envoie les questions au front
                         } 
                    });
                }
            });

        } else {
            let lettresReponse = objetQuestions.synonyme;  //on n'a pas de gagnant on envoie un indice pour aider les joueurs à trouver le mot
            socketIo.emit('lettre', lettresReponse);     // on envoie l'indice au front pour aider les joueurs à trouver le mot
        }   
    }); 

//************************************************************************************    
// Gestion de la deconnection des joueurs
//***********************************************************************************/
    websocketConnection.on('disconnect', function() {
        if(currentPlayer >= 0){     // Joueur courant de cette session-Connexion
            let colJoueur = client.db('jeu').collection('joueur');
            updateDureePlayer(currentPlayer,colJoueur);    // renseignement dans la BDD de la durée de temps passé à jouer du joueur qui se déconnecte 
            joueurs['joueur'+currentPlayer].idConnect = '';  //on réinitialise les données du joueur qui part dans l'objet joueur 
            joueurs['joueur'+currentPlayer].score = 0;
            joueurs['joueur'+currentPlayer].dateDebut = 0;
            joueurs['joueur'+currentPlayer].dateFin = 0;
            joueurs['joueur'+currentPlayer].rapidite = 0;
            joueurs['joueur'+currentPlayer].dernierTemps = 0;
            joueurs['joueur'+currentPlayer].username = '';
            joueurs['joueur'+currentPlayer].ready = false;
            joueurs.compteur = joueurs.compteur -1; 
            joueurs.parti= true; // un joueur a quitté la partie on n'autorisera plus de nouveaux joueurs 
            if (joueurs.compteur == -1) { //il n'y a plus de joueurs connectés qui jouent on autorise une nouvelle partie avec des nouveaux joueurs
                joueurs.parti =false;
                joueurs.max = false;
            }
            websocketConnection.broadcast.emit('removeJoueur', currentPlayer);  // On envoie au front pour suppression du DOM le joueur qui vient de se déconnecter
            getScores(socketIo); // on envoie au front la MAJ du tableau des scores nottament on récupère le temps de jeu du joueur qui vient de partir
        }            
    });

});   //  Fin de la partie "Connexion" 