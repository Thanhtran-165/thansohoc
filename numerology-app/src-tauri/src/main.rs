// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::{Local, NaiveTime, Timelike};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    fs,
    path::PathBuf,
    process::Command,
    sync::{Arc, Mutex},
    thread,
    time::Duration,
};
use tauri::{
    api::notification::{Notification, Sound},
    AppHandle, Manager, State,
};

const NOTIFICATION_EVENT: &str = "notification-dispatched";
const MORNING_KIND: &str = "morning_insight";
const EVENING_KIND: &str = "evening_journal";

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct NotificationRuntimePayload {
    user_id: String,
    user_name: String,
    morning_insight_enabled: bool,
    morning_insight_time: String,
    evening_journal_enabled: bool,
    evening_journal_time: String,
    quiet_hours_enabled: bool,
    quiet_hours_start: Option<String>,
    quiet_hours_end: Option<String>,
    sound_enabled: bool,
}

#[derive(Clone)]
struct NotificationSchedule {
    user_id: String,
    user_name: String,
    morning_insight_enabled: bool,
    morning_insight_time: String,
    evening_journal_enabled: bool,
    evening_journal_time: String,
    quiet_hours_enabled: bool,
    quiet_hours_start: Option<String>,
    quiet_hours_end: Option<String>,
    sound_enabled: bool,
}

impl From<NotificationRuntimePayload> for NotificationSchedule {
    fn from(value: NotificationRuntimePayload) -> Self {
        Self {
            user_id: value.user_id,
            user_name: value.user_name,
            morning_insight_enabled: value.morning_insight_enabled,
            morning_insight_time: value.morning_insight_time,
            evening_journal_enabled: value.evening_journal_enabled,
            evening_journal_time: value.evening_journal_time,
            quiet_hours_enabled: value.quiet_hours_enabled,
            quiet_hours_start: value.quiet_hours_start,
            quiet_hours_end: value.quiet_hours_end,
            sound_enabled: value.sound_enabled,
        }
    }
}

#[derive(Default)]
struct NotificationRuntimeState {
    schedule: Option<NotificationSchedule>,
    last_sent: HashMap<String, String>,
}

#[derive(Clone, Default)]
struct NotificationRuntime(Arc<Mutex<NotificationRuntimeState>>);

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct NotificationDispatchedPayload {
    kind: String,
    user_id: String,
    title: String,
    body: String,
    sent_at: String,
}

#[tauri::command]
fn sync_notification_runtime(
    app: AppHandle,
    runtime: State<NotificationRuntime>,
    payload: NotificationRuntimePayload,
) -> Result<(), String> {
    {
        let mut state = runtime.0.lock().map_err(|_| "notification runtime lock poisoned")?;
        state.schedule = Some(payload.into());
    }

    evaluate_notifications(&app, &runtime.0, 30);
    Ok(())
}

#[tauri::command]
fn clear_notification_runtime(runtime: State<NotificationRuntime>) -> Result<(), String> {
    let mut state = runtime.0.lock().map_err(|_| "notification runtime lock poisoned")?;
    state.schedule = None;
    state.last_sent.clear();
    Ok(())
}

#[tauri::command]
fn sync_launch_on_startup(app: AppHandle, enabled: bool) -> Result<(), String> {
    configure_launch_on_startup(&app, enabled)
}

fn parse_time(value: &str) -> Option<NaiveTime> {
    NaiveTime::parse_from_str(value, "%H:%M:%S")
        .ok()
        .or_else(|| NaiveTime::parse_from_str(value, "%H:%M").ok())
}

fn is_in_quiet_hours(now: NaiveTime, schedule: &NotificationSchedule) -> bool {
    if !schedule.quiet_hours_enabled {
      return false;
    }

    let Some(start) = schedule.quiet_hours_start.as_deref().and_then(parse_time) else {
      return false;
    };
    let Some(end) = schedule.quiet_hours_end.as_deref().and_then(parse_time) else {
      return false;
    };

    if start > end {
        return now >= start || now < end;
    }

    now >= start && now < end
}

fn should_dispatch(now: NaiveTime, target: NaiveTime, catch_up_window_mins: i64) -> bool {
    let now_minutes = i64::from(now.hour() * 60 + now.minute());
    let target_minutes = i64::from(target.hour() * 60 + target.minute());
    let diff = now_minutes - target_minutes;

    diff >= 0 && diff <= catch_up_window_mins
}

fn first_name(user_name: &str) -> &str {
    user_name
        .split_whitespace()
        .last()
        .filter(|value| !value.is_empty())
        .unwrap_or(user_name)
}

fn send_desktop_notification(
    app: &AppHandle,
    schedule: &NotificationSchedule,
    kind: &str,
) -> Result<(), String> {
    let (title, body) = match kind {
        MORNING_KIND => (
            "Nhận định hôm nay đã sẵn sàng".to_string(),
            format!(
                "Mở app để xem thông điệp thần số học dành cho {}.",
                first_name(&schedule.user_name)
            ),
        ),
        EVENING_KIND => (
            "Đến giờ xem lại báo cáo hôm nay".to_string(),
            "Mở lại app để đọc nhanh thông điệp trong ngày và khép lại ngày với một góc nhìn rõ ràng hơn.".to_string(),
        ),
        _ => return Ok(()),
    };

    let identifier = app.config().tauri.bundle.identifier.clone();
    let mut notification = Notification::new(identifier).title(title.clone()).body(body.clone());
    if schedule.sound_enabled {
        notification = notification.sound(Sound::Default);
    }

    notification.show().map_err(|error| error.to_string())?;

    let payload = NotificationDispatchedPayload {
        kind: kind.to_string(),
        user_id: schedule.user_id.clone(),
        title,
        body,
        sent_at: Local::now().to_rfc3339(),
    };

    let _ = app.emit_all(NOTIFICATION_EVENT, payload);
    Ok(())
}

fn maybe_dispatch(
    app: &AppHandle,
    state: &mut NotificationRuntimeState,
    schedule: &NotificationSchedule,
    kind: &str,
    enabled: bool,
    time_str: &str,
    catch_up_window_mins: i64,
) {
    if !enabled {
        return;
    }

    let Some(target) = parse_time(time_str) else {
        return;
    };

    let now = Local::now();
    let today = now.format("%Y-%m-%d").to_string();
    let key = format!("{}:{}", kind, today);
    let current_time = now.time();

    if is_in_quiet_hours(current_time, schedule)
        || !should_dispatch(current_time, target, catch_up_window_mins)
        || state.last_sent.get(&key).map(|value| value == &today).unwrap_or(false)
    {
        return;
    }

    if send_desktop_notification(app, schedule, kind).is_ok() {
        state.last_sent.insert(key, today);
    }
}

fn evaluate_notifications(
    app: &AppHandle,
    runtime: &Arc<Mutex<NotificationRuntimeState>>,
    catch_up_window_mins: i64,
) {
    let mut state = match runtime.lock() {
        Ok(guard) => guard,
        Err(_) => return,
    };

    let Some(schedule) = state.schedule.clone() else {
        return;
    };

    maybe_dispatch(
        app,
        &mut state,
        &schedule,
        MORNING_KIND,
        schedule.morning_insight_enabled,
        &schedule.morning_insight_time,
        catch_up_window_mins,
    );
    maybe_dispatch(
        app,
        &mut state,
        &schedule,
        EVENING_KIND,
        schedule.evening_journal_enabled,
        &schedule.evening_journal_time,
        catch_up_window_mins,
    );
}

fn start_notification_runtime(app: AppHandle, runtime: Arc<Mutex<NotificationRuntimeState>>) {
    thread::spawn(move || loop {
        evaluate_notifications(&app, &runtime, 1);
        thread::sleep(Duration::from_secs(30));
    });
}

#[cfg(target_os = "macos")]
fn configure_launch_on_startup(app: &AppHandle, enabled: bool) -> Result<(), String> {
    let home = std::env::var("HOME").map_err(|error| error.to_string())?;
    let launch_agents_dir = PathBuf::from(home).join("Library/LaunchAgents");
    fs::create_dir_all(&launch_agents_dir).map_err(|error| error.to_string())?;

    let label = format!("{}.autostart", app.config().tauri.bundle.identifier);
    let plist_path = launch_agents_dir.join(format!("{}.plist", label));

    let uid_output = Command::new("id")
        .arg("-u")
        .output()
        .map_err(|error| error.to_string())?;
    let uid = String::from_utf8_lossy(&uid_output.stdout).trim().to_string();
    let domain = format!("gui/{}", uid);
    let plist_path_string = plist_path.to_string_lossy().to_string();

    if enabled {
        let executable = std::env::current_exe().map_err(|error| error.to_string())?;
        let executable_string = xml_escape(&executable.to_string_lossy());
        let plist_contents = format!(
            r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>{label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>{executable}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <false/>
</dict>
</plist>
"#,
            label = label,
            executable = executable_string
        );

        fs::write(&plist_path, plist_contents).map_err(|error| error.to_string())?;

        let _ = Command::new("launchctl")
            .args(["bootout", &domain, &plist_path_string])
            .output();
        let _ = Command::new("launchctl")
            .args(["bootstrap", &domain, &plist_path_string])
            .output();

        return Ok(());
    }

    let _ = Command::new("launchctl")
        .args(["bootout", &domain, &plist_path_string])
        .output();

    if plist_path.exists() {
        fs::remove_file(plist_path).map_err(|error| error.to_string())?;
    }

    Ok(())
}

#[cfg(not(target_os = "macos"))]
fn configure_launch_on_startup(_app: &AppHandle, _enabled: bool) -> Result<(), String> {
    Ok(())
}

fn xml_escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

fn main() {
    tauri::Builder::default()
        .manage(NotificationRuntime::default())
        .setup(|app| {
            let runtime = app.state::<NotificationRuntime>().0.clone();
            start_notification_runtime(app.handle(), runtime);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            sync_notification_runtime,
            clear_notification_runtime,
            sync_launch_on_startup
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
