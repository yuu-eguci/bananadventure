bananadventure
===

🐍 ⚛️ 🐳 🇳 Python 3.13 + Django v4 + Yarn + React + Nginx + Docker + GitHub Actions + Ruff + CI/CD | Banana + Adventure!

![](./docs/(2025-04-06)bananadventure.webp)

## Generated from django-react-gemini

- [https://github.com/yuu-eguci/django-react-gemini](https://github.com/yuu-eguci/django-react-gemini)

## runserver と yarn dev で起動するところまで

```bash
# NOTE: (2025-03-04) 久しぶりに clone してみたけど、マジで
#       Create containers -> Django のほう
#       をサッサと打つだけで開始できた。イイぞ。

# Create containers
cp ./local.env ./.env; cp ./webapp-container/Dockerfile.local ./webapp-container/Dockerfile;
docker compose up -d && docker compose exec webapp-service bash

# Get into webapp-service
# NOTE: It's a good practice to have separate terminals for Django and React for easier debugging and log tracking.
docker compose exec webapp-service bash
# Check↓
python -V
# --> Python 3.12.9
pipenv --version
# --> pipenv, version 2024.4.1
yarn -v
# --> 1.22.22

(cd ./frontend-react; yarn list react)
# --> └─ react@19.0.0

# Django のほう。
# NOTE: PIPENV_VENV_IN_PROJECT は env で設定してある。
pipenv sync --dev
pipenv run python manage.py migrate
pipenv run python manage.py runserver 0.0.0.0:8000
# --> http://localhost:8001/ でアクセス。

# React のほう。
(cd ./frontend-react; yarn install)
(cd ./frontend-react; yarn dev --host)
# --> http://localhost:5001/ でアクセス。
```

```bash
# Test commands.
time pipenv run ruff check .
time pipenv run python manage.py test --failfast --parallel --settings=config.settings_test

# run 無し: watch mode
# run 有り: いつもの
(cd ./frontend-react; time yarn test run)
(cd ./frontend-react; time yarn lint)

# React のほう、 dist を作る -> preview で配信テスト。
(cd ./frontend-react; yarn build)
(cd ./frontend-react; yarn preview --host)
# --> http://localhost:4001/ でアクセス。
```

```bash
# i18n commands.
(cd ./frontend-react; yarn run i18next "./src/App.tsx" "./src/**/*.tsx" --config "./i18next-parser.config.js")
```
