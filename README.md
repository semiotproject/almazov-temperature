## Launch

```bash
npm run {dev|prod}
```

## Deploy to GitHub Pages

```bash
./gh-pages-deploy.sh
```

## Usage
If you want to use platform, other than hardcoded in code without redeploy, just load webpage with URL param `platform`, e.g.:
```
http://semiot.ru/almazov-temperature/?platform=test.semiot.ru
```
This demo assume that platform work on HTTPS. *Do not forget to authorize insecure platform's HTTPS cert in neighbor tab.*
