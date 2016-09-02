## Launch

```bash
npm run {dev|prod}
```

## Deploy to GitHub Pages

```bash
./gh-pages-deploy.sh
```

## Usage
To launch locally, you must build app with `npm run prod` and put files from `./dist` directory to the NGINX - or use [python simple HTTP server](https://docs.python.org/2/library/simplehttpserver.html).
Platform host is defined in `./src/config.js`. If you want to use platform, other than hardcoded in code without redeploy, just load webpage with URL param `platform`, e.g.:
```
http://semiot.ru/almazov-temperature/?platform=test.semiot.ru
```
This demo assume that platform work on HTTPS. **Do not forget to authorize insecure platform's HTTPS cert in neighbor tab.**
