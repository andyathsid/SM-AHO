# QuantifyIQ Real-Time Dashboard

## Description
This is a Flask-based web application developed as part of my university course project, "Consultation Project." It was designed to help a local sock production factory automate the process of counting the socks produced by their machines daily. The application retrieves production data from an IoT device and displays it in real-time on a web dashboard.

The project integrates Firebase for data storage, authentication, and basic state management, along with simple user management features. This is my first self-taught web development project, completed before taking a formal web development course next semester. The application is deployed using Docker and hosted on AWS EC2.

## Features
- **Real-Time Monitoring**: View live data from IoT devices tracking production counts.  
- **Firebase Integration**: Manage data storage and retrieval with Firebase.  
- **User Authentication**: Login and authentication using Firebase.  
- **User Management**: Add, edit, delete, and manage user

## Installation

### Local Setup
1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/yourproject.git
    ```
2. Navigate to the project directory:
    ```sh
    cd yourproject
    ```
3. Create and activate a virtual environment:
    ```sh
    python -m venv myenv
    source myenv/bin/activate
    ```
4. Install the dependencies:
    ```sh
    pip install -r requirements.txt
    ```

## Configuration

1. Create a `.env` file in the root directory and add the following environment variables:
    ```env
    FIREBASE_API_KEY=your_firebase_api_key
    FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    FIREBASE_DATABASE_URL=your_firebase_database_url
    FIREBASE_PROJECT_ID=your_firebase_project_id
    FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    FIREBASE_APP_ID=your_firebase_app_id
    FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
    ```
2. Replace the placeholder values with your Firebase credentials.

### Docker Setup
1. Ensure Docker is installed on your system. If not, install it from [Docker's official website](https://www.docker.com/).
2. Build the Docker image:
    ```sh
    docker build -t quantifyiq .
    ```

## Usage

### Local Setup
1. Run the Flask application:
    ```sh
    flask run
    ```
2. Open your web browser and navigate to `http://<your-host-ip>:5000` (use `localhost` if running locally).

### Docker Setup
1. Run the Docker container:
    ```sh
    docker run -d -p 5000:5000 --env-file .env --name quantifyiq-container quantifyiq
    ```
2. Open your web browser and navigate to `http://<your-host-ip>:5000` (use `localhost` if running locally).
3. To stop the container:
    ```sh
    docker stop quantifyiq-container
    ```



