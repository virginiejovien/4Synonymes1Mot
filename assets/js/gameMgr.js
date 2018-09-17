'use strict';

/*****************************************************************************************************/
/*************************  PARTIE CLIENT  FRONT         *********************************************/
/*****************************************************************************************************/  
        
window.addEventListener('DOMContentLoaded', function() {

//************************************************************************************************
// Déclaration des variables globales
//************************************************************************************************   
    var websocketConnection = io('https://quatre-synonymes-un-mot.herokuapp.com/');
    var formPseudo = window.document.getElementById('form-pseudo');
    var blockPseudo = window.document.getElementById('connect');
    var blockBravo = window.document.getElementById('bravo');
    var blockJoueur = window.document.getElementById('tableau-joueur');
    var joueur0 = window.document.getElementById('joueur0');
    var joueur1 = window.document.getElementById('joueur1');
    var joueur2 = window.document.getElementById('joueur2');
    var joueur3 = window.document.getElementById('joueur3');
    var joueur4 = window.document.getElementById('joueur4');
    var blockScore = window.document.getElementById('recap-score');
    var blockJeu = window.document.getElementById('jeu');
    var blockReady = window.document.getElementById('attente');
    var blockReponse = window.document.getElementById('saisie-reponse'); 
    var lettres = window.document.getElementById('lettre'); 
    var indice = window.document.getElementById('indice'); 
    var elementUsername = window.document.getElementById('username');
    var motUn = window.document.getElementById('mot-un');
    var motDeux = window.document.getElementById('mot-deux');
    var motTrois = window.document.getElementById('mot-trois');
    var motQuatre = window.document.getElementById('mot-quatre');
    var synonyme = window.document.getElementById('synonyme');
    var formReponse = window.document.getElementById('post-reponse');
    var elementReponse = window.document.getElementById('reponse');

    var objetDuJoueur = {};
    
//************************************************************** 
// Affichage des infos des joueurs : avatar, pseudo et score
//**************************************************************
    var affichageInfoJoueur = function(pjoueur){
        var avatarImage = ' <img margin ="auto" src="' +pjoueur.avatar+'"alt="avatar" title="avatar">';  
        var affJoueur = avatarImage + '  ' + pjoueur.username + '   Score: ' +pjoueur.score + '   Rapidité: ' +pjoueur.dernierTemps + ' s'; 
        switch(pjoueur.joueur) {
            case 0:                                           
            joueur0.innerHTML  =  affJoueur;   
            break;
            case 1:                        
            joueur1.innerHTML   =  affJoueur;    
            break;
            case 2:
            joueur2.innerHTML   = affJoueur;   
            break;
            case 3:            
            joueur3.innerHTML   =  affJoueur;              
            break;
            case 4:
            joueur4.innerHTML   =  affJoueur;            
            break;
        };
        return avatarImage;
    }; 

//*************************************************************************************** 
// Affichage des infos et des scores des des joueurs : avatar, pseudo et score, durée
//***************************************************************************************
    var affichageScoresJoueur = function(pjoueur){
        var infoJoueurs = pjoueur;
        blockScore.style.display = 'block'; 
        blockScore.innerHTML = '';
        for (var i=0; i < infoJoueurs.length; i++) {
            var duree = " ";  // on affiche la duree seuleulement s'il c'est différent de zero
            if (infoJoueurs[i].duree !== 0 ) {
                getTemps(infoJoueurs[i].duree);
                duree = '  Temps de jeu: ' +  getTemps(infoJoueurs[i].duree);
            }
            var rapidite = " "; // on affiche la rapidité seuleulement s'il c'est différent de zero
            if (infoJoueurs[i].rapidite !== 0 ) {
                rapidite = '  Rapidité: ' + infoJoueurs[i].rapidite + ' s';
            }
            var avatarImage  = ' <img margin ="auto" src="' + infoJoueurs[i].avatar+'"alt="avatar" title="avatar">';           
            var aff= avatarImage + '  ' + infoJoueurs[i].username + '   Score: ' + '  ' + infoJoueurs[i].score + '  ' +  duree  + '  ' + rapidite; 
            blockScore.innerHTML += aff + "<BR>";
        }
    }; 

//********************************************************************** 
// Déconnection joueur : on retire du Dom les infos du joueur deconnecté
//**********************************************************************  
    var deconnectJoueur = function(pJoueurDeconnect) {
        switch(pJoueurDeconnect) {
            case 0:                                           
            joueur0.innerHTML  =  '';        
            break;
            case 1:                        
            joueur1.innerHTML  = '';        
            break;
            case 2:
            joueur2.innerHTML  = '';        
            break;
            case 3:
            joueur3.innerHTML  =  '';                
            break;
            case 4:
            joueur4.innerHTML  =  '';        
            break;
        };     
    };

//******************************************************************************** 
// convertisseur millisecondes pour afficher le temps passé à jouer au bon format
//********************************************************************************  
    var getTemps = function timeConversion(millisec) {

        var seconds = (millisec / 1000).toFixed(1);
        var minutes = (millisec / (1000 * 60)).toFixed(1);
        var hours = (millisec / (1000 * 60 * 60)).toFixed(1);
        var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

        if (seconds < 60) {
            return seconds + " s";
        } else if (minutes < 60) {
            return minutes + " Min";
        } else if (hours < 24) {
            return hours + " Hrs";
        } else {
            return days + " Jours"
        }
    };

//************************************************************************************************
// Verification que la connexion est établie avec le serveur sur le port:2000
//************************************************************************************************
    websocketConnection.on('connexionServeurOK', function(msg) {
        console.log('msg',msg);
    });

//************************************************************************************************
// A l'évènement submit on envoi au serveur les données du formulaire: le pseudo 
//************************************************************************************************ 
    formPseudo.addEventListener('submit', function (event) { 
        event.preventDefault();                
        objetDuJoueur.username = elementUsername.value;                        
        websocketConnection.emit('controle', objetDuJoueur);
    });

//*******************************************************************************
// message au connecté qu'il ne peut pas jouer car nb de joueurs Maxi atteint (5)
//*******************************************************************************
    websocketConnection.on('nbJoueurMax', function(message) { 
        var messageConnexionMaxi = message;  
        alert(messageConnexionMaxi.message);
        blockPseudo.style.display = 'block'; 
        blockJeu.style.display = 'none'; 
        blockJoueur.style.display = 'none'; 
        blockReady.styledisplay = 'none';        
    });

//*******************************************************************************
// message au connecté qu'il ne peut pas jouer car nb de joueurs Maxi atteint (5)
//*******************************************************************************
    websocketConnection.on('enCours', function(message) { 
        var messagePartiEncours = message;  
        alert(messagePartiEncours.message);
        blockPseudo.style.display = 'block'; 
        blockJeu.style.display = 'none'; 
        blockJoueur.style.display = 'none'; 
        blockReady.styledisplay = 'none';        
    });  

//**************************************************************************************************
// LE CONNECTE EST UN JOUEUR A PRESENT
//**************************************************************************************************  
    websocketConnection.on('pret', function(joueur) {
        if(objetDuJoueur.ready) {
            blockReady.style.display = 'none'; 
        } else {
            blockReady.style.display = 'block'; 
        }
        blockJoueur.style.display = 'block'; //Le client reçoit en retour si tout est ok qu'il est prêt à jouer 
        blockScore.style.display = 'block';  //et les infos des autres joueurs et l'historique des scores et des anciens joueurs

        affichageInfoJoueur(joueur);    // affichage des données joueurs (Avatar, pseudo, score, dernierTemps)

        if (objetDuJoueur.username == joueur.username) {
            objetDuJoueur = joueur;
        }
    });

// Le client reçoit qu'il peut éffacer le formulaire car son inscription au jeu est ok
    websocketConnection.on('EffaceFormulaire', function( ) {
        blockPseudo.style.display = 'none'; 
    });
   
// Le client reçoit la liste des autres joueurs inscrits et aptes à jouer
    websocketConnection.on('listeJoueur', function(joueur) {
        affichageInfoJoueur(joueur); // affichage des données joueurs (Avatar, pseudo, score, dernierTemps, )
    });

// Le client reçoit le Tableau des scores
    websocketConnection.on('scores', function(joueur) {
       affichageScoresJoueur(joueur); // affichage des données joueurs (Avatar, pseudo, score)
    });

//le joueur est prêt à jouer "début du chronomètre" au click Ready:   pour calcul du temps de jeu
    ready.addEventListener('click', function (event) {                         
        blockReady.style.display = 'none'; 
        websocketConnection.emit('ready',objetDuJoueur);           
    });

//le joueur va jouer
    websocketConnection.on('peutJouer', function(objetJoueur) {       
        objetDuJoueur.ready = true;
        blockReady.style.display = 'none';
        blockJeu.style.display = 'block';  //si joueur maitre questions visibles sinon attend la fin de la partie encours
    });
          
// Gestion et alert des messages liés à la connection
    websocketConnection.on('message', function(message) {        
        var messageConnexion = message;
        elementUsername.value = '';  
        alert(messageConnexion.message);
        blockPseudo.style.display = 'block'; 
        blockJeu.style.display = 'none'; 
        blockJoueur.style.display = 'none';         
    });

 // Le joueur reçoit les questions il poura jouer dès que la partie en cours est terminée 
    websocketConnection.on('question', function(documents) {
        blockReponse.style.display = 'block';  
        elementReponse.value = ''; 
        documents.forEach(function(objetQuestion) {
            motUn.innerHTML = objetQuestion.mot1; 
            motDeux.innerHTML = objetQuestion.mot2; 
            motTrois.innerHTML = objetQuestion.mot3; 
            motQuatre.innerHTML = objetQuestion.mot4; 
            synonyme.innerHTML = objetQuestion.synonyme;  
            synonyme.style.display = 'none'; 
            blockBravo.style.display = 'none'; 
            indice.style.display = 'none';      
            lettres.style.display = 'none';                     
        }); 
    
        if (objetDuJoueur.ready) {
            blockJeu.style.display = 'block';  // affichage du block de jeu si le joueur est prêt à jouer
        }       
    });
           
//formulaire "réponse du jeu"       
    formReponse.addEventListener('submit', function (event) { 
        event.preventDefault();
    // On récupére les valeur des champs du formulaire
        var objetReponse = {
            reponse: elementReponse.value,
        };
        objetReponse.joueur = objetDuJoueur.joueur;       
        elementReponse.value = '';
        websocketConnection.emit('reponse', objetReponse); // on envoit au serveur la réponse saisie par le joueur
    });

//on récupère deux indices : 2 lettres qu'on affiche
    websocketConnection.on('lettre', function(lettre) { 
        var mot = lettre;
        indice.innerHTML = "Le mot commence par:";
        indice.style.display = 'block'; 
        lettres.style.display = 'block';                  
        lettres.innerHTML = mot[0] + mot[1];            
    });

//on récupère le gagnant mise à jour du score 
    websocketConnection.on('gagne', function(joueur) { 
        //mise à jour de l'affichage des scores
        var avatarImage =  affichageInfoJoueur(joueur);
        blockBravo.innerHTML = avatarImage + '  BRAVO !!!!';    // affichage de l'avatar du gagnant qu'on félicite
        blockBravo.style.display = 'block'; 
    });

// Le client reçoit le Tableau des scores mise à jour
    websocketConnection.on('scores', function(joueur) {
        affichageScoresJoueur(joueur); // affichage des données joueurs (Avatar, pseudo, score)
    });

// Ici on reçoit les données nécessaire à la suppression d'un joueur
    websocketConnection.on('removeJoueur', function(joueurDeconnect) {
        deconnectJoueur(joueurDeconnect);
    });
}); 