# Cricket Score Management System

A full-stack cricket score management website built with Django REST API and React.

## Features

- **Player**: Register, login, view profile, track stats, participate in matches and tournaments
- **Organizer**: Create single matches and tournaments, assign teams, input scores, view stats and leaderboards
- **Admin**: Site management
- Player dashboard with profile info, match history, and statistics
- Organizer dashboard for match creation, team formation, score input, and tournament management
- Single match and tournament match support
- Automated leaderboard and player stats updates
- Notifications to players for upcoming matches
- Publicly viewable scoreboard pages
- Export match and tournament stats as CSV

## Tech Stack

- **Frontend**: React + Tailwind CSS + Vite
- **Backend**: Django REST API
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Charts**: Chart.js for stats visualization

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis (for Celery)

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Project Structure

```
cricket/
├── backend/
│   ├── cricket_project/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── cricket_api/
│   │   ├── models.py
│   │   ├── models_player.py
│   │   ├── models_team.py
│   │   ├── models_match.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   └── admin.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── context/
    │   └── utils/
    └── package.json
```

## API Endpoints

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login (JWT)
- `POST /api/auth/refresh/` - Refresh token
- `GET/POST /api/players/` - Player management
- `GET /api/players/leaderboard/` - Get leaderboard
- `GET/POST /api/matches/` - Match management
- `POST /api/matches/{id}/update_score/` - Update match score
- `POST /api/matches/{id}/add_delivery/` - Add ball-by-ball delivery
- `GET /api/matches/{id}/scoreboard/` - Get scoreboard
- `GET /api/matches/{id}/export_csv/` - Export match stats as CSV
- `GET/POST /api/tournaments/` - Tournament management
- `GET/POST /api/teams/` - Team management

## License

MIT
