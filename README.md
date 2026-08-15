# ScoobyHouse

Django REST API + vanilla JS SPA for dog shelter directories in Hyderabad and Bangalore.

## Architecture

- **Backend (Django + DRF):** `/api/shelters/`, `/api/meta/`, `/api/donations/`, `/api/auth/`
- **Frontend (vanilla JS modules + esbuild bundle):** `static/app/`
- **Admin:** `/admin/` for managing shelter data
- **Auth:** mobile number + OTP (`/login/`, `/signup/`)
- **Dependencies:** `pyproject.toml`

## Local setup (venv)

```bash
cd my_ngo
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
python manage.py migrate
python manage.py seed_shelters
python manage.py runserver
```

Open [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

If you change frontend source modules, rebuild the SPA bundle:

```bash
npx esbuild static/app/main.js --bundle --format=esm --outfile=static/app/bundle.js
```

## Docker

```bash
docker compose up --build
```

Open [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

The container runs migrations, seeds shelters, and serves on port `8000`. SQLite is stored in the `sqlite_data` volume.

```bash
docker compose exec web python manage.py createsuperuser
docker compose down
```

| Variable | Purpose |
| --- | --- |
| `DJANGO_SECRET_KEY` | Django secret key |
| `DJANGO_DEBUG` | `1` / `0` |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated hosts |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Comma-separated origins |
| `SQLITE_PATH` | SQLite file path (default `/app/data/db.sqlite3` in Docker) |
| `RUN_SEED` | `1` to seed shelters on start |

## CI/CD (GitHub Actions)

On every push and pull request to `main`, GitHub Actions:

1. Installs the package and runs `manage.py check`
2. Applies migrations and runs Django tests
3. Builds the Docker image (no push) to catch packaging issues

Workflow file: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

## API examples

```bash
curl http://127.0.0.1:8000/api/meta/
curl -X POST http://127.0.0.1:8000/api/donations/submit/ \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test Donor","email":"test@example.com","phone":"9876543210","amount":500,"purpose":"general"}'
curl http://127.0.0.1:8000/api/shelters/
```

## Admin

```bash
python manage.py createsuperuser
```
