# lttb-server

## Overview

`lttb-server` is a backend server designed to support the **ListenToThis, Bro** project. This repository provides the server-side functionality, including APIs and data management, to enable seamless interaction with the client-side application.

## Features

- **User Authentication**: OAuth2-based authentication with Spotify.
- **Playlist Management**: Create and manage playlists for users and their followers.
- **Follower Tracking**: Scrape and store Spotify follower data.
- **Rate Limiting**: Protect APIs with configurable rate limits.
- **Session Management**: Secure session handling with MongoDB-backed storage.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/lttb-server.git
    cd lttb-server
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    - Create a `.env` file in the root directory.
    - Add the following variables:
      ```
        PORT=3000
        CLIENT_ID=your_spotify_client_id
        CLIENT_SECRET=your_spotify_client_secret
        REDIRECT_URI=your_redirect_uri
        CLIENT_URL=your_client_url
        SESSION_SECRET=your_session_secret
        MONGO_CONNECTION_URI=your_mongo_connection_uri
        APP_NAME=listentothis,bro
      ```

4. Start the server:
    ```bash
    npm start
    ```

## API Endpoints

### Authentication
- **GET** `/api/login`: Redirects to Spotify login.
- **GET** `/api/token`: Handles Spotify OAuth2 token exchange.
- **DELETE** `/api/logout`: Logs out the user.

### Profile
- **GET** `/api/profile`: Fetches the user's Spotify profile.
- **GET** `/api/profile/artists`: Fetches the user's top artists.

### Playlist
- **POST** `/api/playlist`: Creates a playlist for a follower.

### Follower
- **GET** `/api/follower`: Fetches or scrapes the user's followers.

### Health Check
- **GET** `/api/health`: Returns the server's health status.

## Deployment

This project is configured for deployment on Vercel. The `vercel.json` file specifies the build and routing configuration.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request with a detailed description of your changes.

## Contact

For questions or support, please reach out at `parthskansara@gmail.com`.