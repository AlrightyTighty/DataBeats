# DataBeats

DataBeats is a music streaming web application made for listeners and musicians alike.

*A product of Dr. Uma Ramamurthy's COSC 3380 Database Systems course, section 19717, at the University of Houston.*

## Features
- Listeners
    - stream music
    - create your own playlists
    - browse artists and events
- Musicians
    - upload music
    - post upcoming events
    - view detailed stats on song performance
- Administrators
    - monitor user activity
    - moderate reported content
    - view system popularity and activity stats

## Tech Stack
- Database: MySQL
- Backend: ASP.NET Core
- Frontend: React

## Quick Start
Visit our deployed web application at https://databeats-frontend-63991322723.us-south1.run.app/

## For Developers

### Prerequisites
Before you begin, ensure you have the following installed:

- **.NET SDK 9.0** or higher - [Download here](https://dotnet.microsoft.com/download)
- **Node.js 22.x** - [Download here](https://nodejs.org/)
- **MySQL 8.0.28+** - [Download here](https://dev.mysql.com/downloads/)
- **Git** - [Download here](https://git-scm.com/)

You should also have your own MySQL database dump ready to import.

### 1. Clone the Repository
```bash
git clone https://github.com/AlrightyTighty/DataBeats.git
cd DataBeats
```

### 2. Database Setup
Import your MySQL database dump into your local MySQL server. The application expects a database named `music_db` by default, but you can configure this in your connection string.

```bash
# Example MySQL import command
mysql -u your_username -p music_db < your_database_dump.sql
```

### 3. Backend Setup
The backend is an ASP.NET Core Web API (.NET 9.0) that connects to MySQL.

#### Set the Database Connection String
You need to provide the MySQL connection string via the `ConnectionStrings__DefaultConnection` environment variable.

**Connection String Format:**
```
Server=localhost;Port=3306;Database=music_db;User=your_username;Password=your_password;
```

**Setting the Environment Variable:**

On **Linux/macOS**:
```bash
export ConnectionStrings__DefaultConnection="Server=localhost;Port=3306;Database=music_db;User=your_username;Password=your_password;"
```

On **Windows (PowerShell)**:
```powershell
$env:ConnectionStrings__DefaultConnection="Server=localhost;Port=3306;Database=music_db;User=your_username;Password=your_password;"
```

On **Windows (Command Prompt)**:
```cmd
set ConnectionStrings__DefaultConnection=Server=localhost;Port=3306;Database=music_db;User=your_username;Password=your_password;
```

#### Install Dependencies and Run
```bash
cd backend
dotnet restore
dotnet run
```

The backend API will start on **http://localhost:5062**

### 4. Frontend Setup
The frontend is a React application built with Vite.

#### Create Environment File
Create a `.env` file in the `frontend` directory:

```bash
cd frontend
```

Add the following content to `.env`:

```env
VITE_API_BASE_URL=http://localhost:5062
```

#### Install Dependencies and Run
```bash
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**

### 5. Access the Application
Open your browser and navigate to:

```
http://localhost:5173
```

You should now see the DataBeats application running locally.

### Troubleshooting
- **Backend connection errors**: Verify your MySQL connection string is correct and the database is running
- **Frontend API errors**: Ensure the backend is running on port 5062 and the `.env` file is properly configured
- **Port conflicts**: If ports 5062 or 5173 are already in use, you can modify them in `backend/appsettings.json` and `frontend/vite.config.js` respectively