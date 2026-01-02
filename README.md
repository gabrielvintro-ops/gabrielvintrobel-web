# Gabriel Vintró Bel — Web

## Instruccions per publicar a GitHub Pages

1. Crea un repositori a GitHub (públic).
2. Puja tots els fitxers d'aquest ZIP al repositori.
3. Al terminal:
   ```bash
   git init
   git add .
   git commit -m "Primera versió del web"
   git branch -M main
   git remote add origin https://github.com/<el_teu_usuari>/<nom_repositori>.git
   git push -u origin main
   ```
4. A GitHub, ves a **Settings → Pages**.
   - Source: Branch `main`, carpeta `/root`.
5. Desa i espera uns segons. La teva web estarà disponible a:
   ```
   https://<el_teu_usuari>.github.io/<nom_repositori>/
   ```

## Fitxers inclosos
- index.html
- works.html
- styles.css
- script.js
- assets/img (imatges originals)
- assets/audio (àudios)
- assets/scores (partitures)
- media.json (catàleg audiovisual)
- sitemap.xml
- robots.txt
