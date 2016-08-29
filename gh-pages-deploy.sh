npm i
npm run prod
git add dist && git commit -m "gh-pages deploy"
git push origin `git subtree split --prefix dist master`:gh-pages --force
