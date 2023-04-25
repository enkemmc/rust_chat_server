use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::Cookie;
use rocket::{Request, Response};
use uuid::Uuid;
use redis::AsyncCommands;
use async_trait::async_trait;
use log::info;


pub struct RedisSession;

#[async_trait]
impl Fairing for RedisSession {
    fn info(&self) -> Info {
        Info {
            name: "RedisSession",
            kind: Kind::Response,
        }
    }

    async fn on_request(&self, request: &mut Request<'_>, _: &mut rocket::Data<'_>) {
        let session_id = request.cookies().get("session_id").map(|cookie| cookie.value().to_string());

        info!("Checking for session_id cookie...");
        if let Some(session_id) = session_id {
            info!("Found session_id cookie: {}", session_id);
            if let Ok(session) = get_session(&session_id).await {
                if let Some(session_data) = session {
                    info!("Session data from Redis: {}", session_data);
                    request.local_cache(|| session_data);
                }
            }
        }
    }

    // this adds a session's cookies to all outgoing responses
    // this is also where all initial session_ids are created after login
    async fn on_response<'r>(&self, request: &'r Request<'_>, response: &mut Response<'r>) {
        // Check if there's a session in request.local_cache
        let session_data = request.local_cache(|| None::<String>);

        // If there's a session, store it in Redis and set the session_id cookie
        if let Some(session_data) = session_data {
            let session_id = Uuid::new_v4().to_string();
            if let Err(err) = set_session(&session_id, session_data).await {
                eprintln!("Error setting session in Redis: {}", err);
            } else {
                let private_cookie = Cookie::new("session_id", session_id);
                let private_cookie_jar = request.cookies().clone();
                private_cookie_jar.add_private(private_cookie);

                for cookie in private_cookie_jar.iter() {
                    response.adjoin_header(cookie);
                }
            }
        }
    }
}

async fn connect() -> Result<redis::aio::Connection, redis::RedisError> {
    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1/".to_string());
    let client = redis::Client::open(redis_url)?;
    client.get_async_connection().await
}

pub async fn set_session(session_id: &str, session_data: &str) -> Result<(), redis::RedisError> {
    info!("Setting session with ID: {}", session_id);
    let mut connection = connect().await?;
    connection.set_ex(session_id, session_data, 3600).await // Set session expiration to 1 hour
}

pub async fn get_session(session_id: &str) -> Result<Option<String>, redis::RedisError> {
    info!("Getting session with ID: {}", session_id);
    let mut connection = connect().await?;
    connection.get(session_id).await
}
