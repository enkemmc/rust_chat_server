use rocket::fairing::AdHoc;
use serde::{Deserialize, Serialize};

use rocket::Request;
use reqwest::header::{USER_AGENT, AUTHORIZATION, HeaderValue, HeaderMap, ACCEPT};
use rocket::get;
use rocket::http::CookieJar;
use rocket::response::Redirect;
use std::env;
use rocket::http::{Cookie, SameSite};
use rocket::serde::json::Json;
use rocket::http::Status;
use rocket::request::{self, FromRequest, Outcome};
use uuid::Uuid;
use log::info;

//use crate::routes::redis::{get_session, set_session};
use crate::auth::redis::{get_session, set_session};

#[derive(Serialize, Deserialize, Debug)]
pub struct AccessToken {
    pub access_token: String,
    pub token_type: String,
    pub scope: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub login: String,
    pub id: u32,
    pub node_id: String,
    pub avatar_url: String,
    pub gravatar_id: String,
    pub url: String,
    pub html_url: String,
    pub followers_url: String,
    pub following_url: String,
    pub gists_url: String,
    pub starred_url: String,
    pub subscriptions_url: String,
    pub organizations_url: String,
    pub repos_url: String,
    pub events_url: String,
    pub received_events_url: String,
    #[serde(rename = "type")]
    pub account_type: String,
    pub site_admin: bool,
}

pub fn attach_github_oauth() -> AdHoc {
    AdHoc::on_request("GitHub OAuth", |_, _| Box::pin(async move {}))
}

pub struct UserSession {
    pub session_data: String,
}

#[derive(Debug)]
pub struct UserSessionError;


impl std::fmt::Display for UserSessionError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "UserSessionError")
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for UserSession {
    type Error = UserSessionError;

    async fn from_request(request: &'r Request<'_>) -> request::Outcome<UserSession, Self::Error> {
        let session_id = request.cookies().get_private("session_id").map(|cookie| cookie.value().to_string());
        info!("Attempting to derive sessionid within from_request on UserSession {:?}", session_id);

        if let Some(session_id) = session_id {
            if let Ok(session) = get_session(&session_id).await {
                if let Some(session_data) = session {
                    return Outcome::Success(UserSession { session_data });
                }
            } else {
                info!("Get session failed?");
            }
        }
        Outcome::Error((Status::Unauthorized, UserSessionError))
    }
}

#[get("/user_info")]
pub async fn user_info(user_session: UserSession) -> Option<Json<UserInfo>> {
    // Deserialize the session_data into a UserInfo struct
    // note that all outbound requests should automatically include session data
    // this function  may not be necessary
    let user_info: UserInfo = serde_json::from_str(&user_session.session_data).ok()?;
    Some(Json(user_info))
}

#[derive(Serialize, Deserialize)]
pub struct UserInfo {
    pub user_id: String,
    pub username: String,
}

#[get("/login")]
pub fn login() -> Redirect {
    let client_id = std::env::var("GITHUB_CLIENT_ID").expect("GITHUB_CLIENT_ID must be set");
    let redirect_uri = std::env::var("REDIRECT_URI").expect("REDIRECT_URI must be set");
    let scope = "user";
    let auth_url = format!(
        "https://github.com/login/oauth/authorize?client_id={}&redirect_uri={}&scope={}",
        client_id, redirect_uri, scope
    );

    Redirect::found(auth_url)
}

#[get("/callback?<code>")]
pub async fn oauth_callback(code: String, cookies: &CookieJar<'_>) -> Result<Redirect, String> {
    let access_token = match get_access_token(&code).await {
        Ok(token) => token,
        Err(e) => return Err(format!("Failed to get access token: {}", e)),
    };

    let user = match get_user_info(&access_token).await {
        Ok(user) => user,
        Err(e) => return Err(format!("Failed to get user information: {}", e)),
    };

    cookies.add_private(Cookie::build(("username", user.login.to_string())).same_site(SameSite::Strict));
    
    cookies.add_private(Cookie::build(("user_id", user.id.to_string()))
        .same_site(SameSite::Strict));

    // gonna create the session_id right here
    let session_id = Uuid::new_v4().to_string();
    cookies.add_private(Cookie::build(("session_id", session_id.to_string()))
        .same_site(SameSite::Strict));

    // store session in redis
    let user_info = UserInfo {
        user_id: user.id.to_string(),
        username: user.login,
    };
    let new_session_data = serde_json::to_string(&user_info).unwrap();
    match set_session(&session_id, &new_session_data).await {
        Ok(_) => (),
        Err(e) => return Err(format!("Redis error: {}", e)),
    }

    Ok(Redirect::found("/rust_chat_server"))
}

#[get("/logout")]
pub fn logout(cookies: &CookieJar<'_>) -> Redirect {
    cookies.remove_private(Cookie::from("session_id"));
    Redirect::to("/rust_chat_server")
}

use std::error::Error;

async fn get_access_token(code: &str) -> Result<AccessToken, Box<dyn Error>> {
    let client_id = env::var("GITHUB_CLIENT_ID")?;
    let client_secret = env::var("GITHUB_CLIENT_SECRET")?;

    let client = reqwest::Client::new();

    let params = [
        ("client_id", client_id.as_str()),
        ("client_secret", client_secret.as_str()),
        ("code", code),
    ];

    let token = client
        .post("https://github.com/login/oauth/access_token")
        .header(USER_AGENT, "reqwest")
        .header(ACCEPT, "application/json")
        .form(&params)
        .send()
        .await?
        .json::<AccessToken>()
        .await?;

    Ok(token)
}

async fn get_user_info(access_token: &AccessToken) -> Result<User, Box<dyn Error>> {
    let mut headers = HeaderMap::new();
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&format!("token {}", access_token.access_token))?,
    );
    headers.insert(USER_AGENT, HeaderValue::from_static("reqwest"));

    let client = reqwest::Client::new();
    let user = client
        .get("https://api.github.com/user")
        .headers(headers)
        .send()
        .await?
        .json::<User>()
        .await?;

    Ok(user)
}
