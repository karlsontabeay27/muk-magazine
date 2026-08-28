# Régénérer les fontes auto-hébergées

Les fontes ne sont **pas** chargées depuis Google : chaque visite transmettrait
l'adresse IP du lecteur à un tiers aux États-Unis, ce qui alourdirait la
politique de confidentialité sans rien apporter au site.

Pour les mettre à jour ou en ajouter une :

1. Composer l'URL de l'API Google Fonts avec les familles voulues.
2. Récupérer la feuille avec un navigateur récent comme `User-Agent`
   (sans quoi Google renvoie du `ttf` au lieu du `woff2`) :

```bash
curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=..." > gf.css
```

3. Ne garder que les sous-ensembles `latin` et `latin-ext` — le site est en
   français et en anglais, les alphabets grec, cyrillique et vietnamien
   n'ont pas à être téléchargés.
4. Télécharger chaque `woff2` dans `public/fontes/`, réécrire les `src:` en
   chemins locaux, et déposer les règles dans `app/fontes.css`.

Les `unicode-range` doivent être conservés tels quels : c'est ce qui permet au
navigateur de ne charger `latin-ext` que s'il rencontre un caractère qui
l'exige.

Toutes les familles utilisées sont sous licence SIL Open Font License,
redistribution et usage commercial compris.
