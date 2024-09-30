#[macro_use] extern crate rocket;

use rocket::fs::FileServer;
use rocket::tokio::sync::broadcast::channel;
use simple_logger::SimpleLogger;
use log::LevelFilter;

mod routes;
use routes::chat_app::{post, events, Message};

mod auth;
use auth::github::{attach_github_oauth, oauth_callback, user_info, login, logout};

#[get("/")]
fn test_me() -> &'static str {
    "Hello!"
}


#[launch]
fn rocket() -> _ {
    let _ = dotenv::dotenv();
    // let chat_bundle_path = std::env::var("CHAT_BUNDLE_PATH").unwrap_or("build".to_string());
    SimpleLogger::new()
        .with_level(LevelFilter::Info)
        .init()
        .expect("Failed to initialize logger");
    //let static_path = "client/build".to_string();
    rocket::build()
        .manage(channel::<Message>(1024).0)
        .attach(attach_github_oauth())
        .mount("/rust_chat_server/auth/github", routes![oauth_callback, user_info, login, logout])
        .mount("/rust_chat_server/api", routes![post, events])
        .mount("/rust_chat_server/hello", routes![test_me])
        // .mount("/rust_chat_server", FileServer::from(chat_bundle_path))
}
