# Rust Chat Server

This is a simple chat server application built using Rust, Rocket, and Redis. It demonstrates the use of GitHub OAuth for user authentication and Redis for session management.

## Features

- User authentication via GitHub OAuth
- Session management using Redis
- Login and logout functionality
- Simple chat interface (not implemented in the provided code)

## Getting Started

### Prerequisites

- Rust and Cargo: Install Rust and Cargo using [rustup](https://rustup.rs/)
- Redis: Install and run [Redis](https://redis.io/download)

### Environment Variables

Create a `.env` file in the project root directory and add the following environment variables:

```plaintext
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
REDIS_URL=redis://127.0.0.1/

Replace your_github_client_id and your_github_client_secret with your GitHub OAuth application's client ID and secret. Update the REDIS_URL if necessary.

# Running the Application

1. Clone the repository:
```sh
git clone https://github.com/your_username/rust_chat_server.git
cd rust_chat_server
```

2. Build the application:
```sh
cargo run
```

3. Open a web browser and navigate to http://localhost:8000/login to see the application in action.

# Contributing

Contributions are welcome! If you'd like to improve the code, submit a pull request, or open an issue for discussion.
