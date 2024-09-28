### Project Overview: Logging HTTP Web Service with PostgreSQL

This project is a robust and scalable **Logging HTTP Web Service** designed to handle log data submissions, user authentication, and reporting. It is built using **Node.js/Express.js/Typescript** as the backend framework and **PostgreSQL** as the primary database for storing log entries and user data. The web service provides secure endpoints for user registration, authentication, log message submission, and report generation. The system is optimized for performance, reliability, and scalability while adhering to modern security best practices.

### Key Features:
1. **User Registration and Authentication**: 
   - Users can securely register and authenticate themselves using their email and password. Authentication is implemented with JWT (JSON Web Tokens) to manage user sessions and protect access to log submission and reporting endpoints.
   
2. **Log Submission**: 
   - Authenticated users can submit logs, which are timestamped and categorized by severity levels: `info`, `warning`, and `error`. Each log message is stored in a PostgreSQL database along with metadata such as the user ID, the timestamp of submission, and whether the log contains HTTP localhost URLs.
   
3. **Reporting**: 
   - Administrators can generate detailed reports based on logs over a specified time period. Reports include counts of warning and error logs, as well as the number of log messages that contain HTTP localhost URLs. This enables users to analyze system activity and troubleshoot issues efficiently.

4. **Error Handling & Security**:
   - The system is designed with robust error handling mechanisms, providing appropriate feedback for invalid requests, large payloads, and unauthorized access. Furthermore, security features such as encrypted passwords, protection against SQL injection, and validation of user input ensure that the service remains secure against common vulnerabilities.

### Technologies Used:
- **Node.js / Express.js**: Backend framework for building scalable and efficient web services.
- **PostgreSQL**: Relational database for storing user and log data, optimized for handling large volumes of structured data.
- **Zod**: Schema validation library to ensure that incoming log messages and user data meet the required format and constraints.
- **Docker & Docker Compose**: Containerization tools to streamline development, deployment, and scaling of the service across environments.

### Getting Started:
To get started with the Logging HTTP Web Service, follow the instructions for setting up the environment, running the Docker containers, and interacting with the API endpoints. Detailed examples of API requests and responses are provided in the API documentation [here](https://documenter.getpostman.com/view/25479861/2sAXqzVxaL)

### 1. Prerequisites
Make sure you have:
- **Node.js** (v14 or later)
- **npm**
- **Docker** and **Docker Compose** (if using Docker)

### 2. Install Dependencies
Run the following command to install all necessary packages:
```bash
npm install
```

### 3. Running the Service

#### a) **Development Mode** (with live reload)
To start the service in development mode:
```bash
npm run dev
```

#### b) **Production Mode** (compiled code)
First, compile the code:
```bash
npm run build
```
Then, start the service:
```bash
npm start
```

#### c) **Using Docker**
To start the service with Docker (including PostgreSQL):
```bash
npm run docker
```
To rebuild Docker images and start:
```bash
npm run docker:build
```

### 4. Accessing the API
Once running, access the service at:
```
http://localhost:3000
```
