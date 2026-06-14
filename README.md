bananadventure
===

🐍 ⚛️ 🐳 🇳 Python 3.13 + Django v4 + Yarn + React + Nginx + Docker + GitHub Actions + Ruff + CI/CD | Banana + Adventure!

## Generated from django-react-gemini

- [https://github.com/yuu-eguci/django-react-gemini](https://github.com/yuu-eguci/django-react-gemini)

### V2

https://github.com/user-attachments/assets/23fa03ab-c852-4133-a322-1244e99c1080

### V1

![](./docs/(2026-06-13)bananadventure.webp)

### V0

![](./docs/(2025-04-06)bananadventure.webp)

## Compose ファイル名移行メモ

- Compose 定義ファイルは `docker-compose.yml` から `compose.yaml` へ移行済み。
- ふだんの運用は `docker compose` コマンドをそのまま使えば OK。
- 旧コマンド例: `docker compose -f docker-compose.yml up -d`
- 新コマンド例: `docker compose up -d`

## runserver と yarn dev で起動するところまで

```bash
# Create containers
cp ./local.env ./.env; cp ./webapp-container/Dockerfile.local ./webapp-container/Dockerfile;
docker compose up -d
# 旧 webapp-service が残っている場合の初回移行だけ:
# docker compose up -d --remove-orphans

# Status
docker compose ps

# Logs
docker compose logs -f django-service
docker compose logs -f react-service
docker compose logs -f mysql-service

# Access URLs
# Django -> http://localhost:8001/
# React  -> http://localhost:5001/

# Get into containers
docker compose exec django-service bash
docker compose exec react-service bash

# Restart each service
docker compose restart django-service
docker compose restart react-service

# Stop
docker compose down
```

```bash
# Check versions
docker compose exec django-service python -V
docker compose exec django-service pipenv --version
docker compose exec django-service yarn -v
docker compose exec react-service yarn list react
```

```bash
# Troubleshooting: django-service が "Temporary failure in name resolution" で落ちる場合
docker compose restart django-service
docker compose logs -f django-service
# それでも解消しないときは Docker Desktop 側の DNS / ネットワークを確認
# ( 本 compose では django-service / react-service に 1.1.1.1 と 8.8.8.8 を明示済み )
# 反映は recreate が必要:
# docker compose up -d --force-recreate django-service react-service
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
