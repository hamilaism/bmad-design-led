// Sentinelle d'erreur DANS le flux de chat (module partagé client/serveur, sans dépendance).
// Une erreur qui survient APRÈS le début du stream ne peut plus changer le statut HTTP :
// on la marque hors-bande pour que le client l'affiche comme erreur au lieu de la laisser
// entrer dans le transcript (où elle finirait distillée dans la fiche).
export const STREAM_ERR = "␞[[erreur-flux]]␞";
