# J’espère que vous êtes en train de lire ce fichier

Au moment où j’écris ce message, il y a encore quelques bugs à régler et des inconsistances. Donc faites un `git pull` avant de regarder le projet, au cas où j’ai eu la motivation de tout finir.

```bash
git pull
```

## Pour construire et lancer le projet

```bash
cd project-root && docker compose up --build
```

## Le projet

Pour le projet, on a fait une API basée sur Undertale.
On a ajouté les monstres principaux du jeu et on a fait une petite interface pour les afficher et les combattre.

## Déploiement

Pour le déploiement, j’ai pas trouvé l’option pour host sur GitHub.
Peut-être que si je suis motivé je le host sur mon serveur avec ma clé Cloudflare Warp.

Vous pouvez vérifier sur :
[https://jobo.gay](https://jobo.gay)

(désolé pour le nom de domaine)

Si vous voyez une page Cloudflare, ça veut dire que j’ai eu la flemme de le finir

## Routes publiques de l’API

`http://localhost/api/monsters`

Toutes les autres routes sont protégées par JWT.
Il faut s’inscrire ou se connecter pour les utiliser.

Derniere chose, pour voir la base de données, vous pouvez utiliser dbgate sur `http://localhost:8081`
le mdp pour la bd mango est root root123 tout est de le `.env`
