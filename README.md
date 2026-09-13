# PCMaxing.com
[![Backend Tests](https://github.com/aryanbhalerao/PCMaxing_Go/actions/workflows/backend-tests.yml/badge.svg?branch=main)](https://github.com/aryanbhalerao/PCMaxing_Go/actions/workflows/backend-tests.yml)
[![Frontend E2E Tests](https://github.com/aryanbhalerao/PCMaxing_Go/actions/workflows/frontend-tests.yml/badge.svg?branch=main)](https://github.com/aryanbhalerao/PCMaxing_Go/actions/workflows/frontend-tests.yml)

PCMaxing is a full-stack web application designed for PC enthusiasts to build, customize, and check the compatibility of their dream PC setups. 

## Features

* **Component Browsing**: Browse a wide variety of PC parts including CPUs, GPUs, Motherboards, RAM, Storage, PSUs, Cases, and Peripherals.
* **Compatibility Checker**: Automatically verifies compatibility between selected components (e.g., checks motherboard form factor against case size, CPU socket matching, GPU length against case limits, and total TDP against PSU wattage).
* **Custom PC Builds**: Create, name, and save your own custom PC builds. View your build history and total pricing.
* **Favourites**: Save your most wanted components to your personal favourites list for quick access.
* **Popular Builds**: Explore trending and popular PC builds organized by tier lists.
* **User Authentication**: Secure user signup, login, and session management using JWTs.

## Tech Stack

* **Frontend**: React (built with Vite), TypeScript
* **Backend**: Go (using `go-chi` for routing)
* **Database**: SQLite (CGO-free via `modernc.org/sqlite`) managed through **GORM**
* **Deployment**: Docker, Docker Compose, Nginx

## How to Run

### Using Docker (Recommended)

The easiest way to run the project is using Docker and Docker Compose. This will automatically build the frontend, compile the Go backend, set up Nginx, and link everything together.

1. Ensure you have Docker and Docker Desktop installed.
2. Clone this repository.
3. Run the following command in the root directory:
   ```bash
   docker compose up --build
   ```
4. Once the containers are running, open your browser and visit: `http://localhost`

### Local Development

If you prefer to run the application locally for development without Docker:

**1. Start the Backend:**
Make sure you have Go 1.22+ installed.
```bash
# From the project root, download dependencies
go mod tidy

# Run the backend server
go run backend/main.go
```
The API will run on `http://localhost:5000`.

**2. Start the Frontend:**
Make sure you have Node.js installed.
```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The frontend will run on `http://localhost:5173` (by default) and proxy `/api` requests to the Go backend.

## Tests

Our test architecture ensures comprehensive coverage across the stack. The frontend utilizes end-to-end (E2E) UI testing to validate user flows, compatibility checker edge cases, and theme rendering. The backend employs unit and integration tests written in Go to verify authentication logic, database integrity, and REST API functionality. Both suites are integrated into our GitHub Actions CI/CD pipelines.

* [Frontend Tests](docs/frontend_tests.md)
* [Backend Tests](docs/backend_tests.md)

## Snapshots

Here is a glimpse of the PC Builder UI and compatibility checker in action:

![PC Builder Light Mode](docs/snapshots/build.png)
![PC Builder Dark Mode](docs/snapshots/build_dark.png)
![Compatibility Issue Light](docs/snapshots/build_compatibility_issue.png)
![Compatibility Issue Dark](docs/snapshots/build_compatibility_issue_dark.png)
