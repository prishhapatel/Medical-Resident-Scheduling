# PSYCALL Backend Setup
Simple script to start the backend server.

## Usage
```bash

# Run server
dotnet run
```

## What it does
- Connects to SQL Server database
- Starts API server on port 7000
- Handles authentication and scheduling requests

## Requirements
- .NET 8 SDK
- SQL Server 2019+
- Database connection string in appsettings.json

## Setup Environment
```bash
# Create .env
.env

# Edit .env.local with your settings
NEXT_PUBLIC_API_URL=http://localhost:YOUR_PORT
DB_CONNECTION_STRING=Server=YOUR_SERVER;Port=YOUR_PORT;Database=YOUR_DB;User=YOUR_USER;Password=YOUR_PASSWORD;
```
