use base64::{engine::general_purpose, Engine as _};
use headless_chrome::protocol::cdp::Page::CaptureScreenshotFormatOption;
use headless_chrome::{Browser, LaunchOptionsBuilder};
use serde::Serialize;

#[derive(Serialize)]
struct ScreenshotResult {
    success: bool,
    message: Option<String>,
    image_data: Option<String>, // Base64 encoded image
}

#[tauri::command]
async fn take_screenshot(url: String) -> ScreenshotResult {
    println!("Taking screenshot of: {}", url);

    let launch_options = LaunchOptionsBuilder::default()
        .headless(true) // Ensure it runs headless
        .build()
        .unwrap();

    match Browser::new(launch_options) {
        Ok(browser) => {
            match browser.new_tab() {
                Ok(tab) => {
                    match tab.navigate_to(&url) {
                        Ok(_) => {
                            match tab.wait_until_navigated() {
                                Ok(_) => {
                                    match tab.capture_screenshot(
                                        CaptureScreenshotFormatOption::Png,
                                        Some(90),
                                        None,
                                        false,
                                    ) {
                                        Ok(png_data) => {
                                            // Encode the image data as base64 for transmission to the frontend.
                                            let base64_image =
                                                general_purpose::STANDARD.encode(&png_data);

                                            ScreenshotResult {
                                                success: true,
                                                message: Some(
                                                    "Screenshot taken successfully".to_string(),
                                                ),
                                                image_data: Some(format!(
                                                    "data:image/png;base64,{}",
                                                    base64_image
                                                )),
                                            }
                                        }
                                        Err(e) => {
                                            eprintln!("Error capturing screenshot: {:?}", e);
                                            ScreenshotResult {
                                                success: false,
                                                message: Some(format!(
                                                    "Error capturing screenshot: {:?}",
                                                    e
                                                )),
                                                image_data: None,
                                            }
                                        }
                                    }
                                }
                                Err(e) => {
                                    eprintln!("Error waiting for navigation: {:?}", e);
                                    ScreenshotResult {
                                        success: false,
                                        message: Some(format!(
                                            "Error waiting for navigation: {:?}",
                                            e
                                        )),
                                        image_data: None,
                                    }
                                }
                            }
                        }
                        Err(e) => {
                            eprintln!("Error navigating to URL: {:?}", e);
                            ScreenshotResult {
                                success: false,
                                message: Some(format!("Error navigating to URL: {:?}", e)),
                                image_data: None,
                            }
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Error creating new tab: {:?}", e);
                    ScreenshotResult {
                        success: false,
                        message: Some(format!("Error creating new tab: {:?}", e)),
                        image_data: None,
                    }
                }
            }
        }
        Err(e) => {
            eprintln!("Error launching browser: {:?}", e);
            ScreenshotResult {
                success: false,
                message: Some(format!("Error launching browser: {:?}", e)),
                image_data: None,
            }
        }
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, take_screenshot])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
