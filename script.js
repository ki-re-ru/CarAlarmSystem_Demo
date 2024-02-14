const start_page = "index.html";
const armed_page = "armed.html";
const alarm_page = "alarm.html";

const TIME_UNTIL_ARMED = 20;
const TIME_UNTIL_SOUND_OFF = 30;
const TIME_UNTIL_ALARM_OFF = 300;

let buttons = document.getElementsByClassName("button")

// STATE
let currently_open = 0b0000;
let locked = false;
let armed = false;
let alarm = false;
let sound = false;
let flash = false;
let total_time = 0;
let timer_armed = 0;
let timer_alarm = 0;

function storeCookies()
{
    document.cookie = "locked=" + locked.toString();
    document.cookie = "armed=" + armed.toString();
    document.cookie = "alarm=" + alarm.toString();
    document.cookie = "sound=" + sound.toString();
    document.cookie = "flash=" + flash.toString();
    document.cookie = "currently_open=" + currently_open.toString();
    document.cookie = "total_time=" + total_time.toString();
    document.cookie = "timer_armed=" + timer_armed.toString();
    document.cookie = "timer_alarm=" + timer_alarm.toString();
}

function loadCookies()
{
    if(document.cookie === "")
    {
        return;
    }

    var all_cookies = document.cookie.split("; ");
    for(var i = 0; i < all_cookies.length; i++)
    {
        var cookie = all_cookies[i].split("=");
        var key = cookie[0];
        var value = cookie[1];

        switch(key)
        {
            case "locked":
                locked = (value === 'true');
                break;
            case "armed":
                armed = (value === 'true');
                break;
            case "alarm":
                alarm = (value === 'true');
                break;
            case "sound":
                sound = (value === 'true');
                break;
            case "flash":
                flash = (value === 'true');
                break;
            case "currently_open":
                currently_open = Number(value);
                break;
            case "total_time":
                total_time = Number(value);
                break;
            case "timer_armed":
                timer_armed = Number(value);
                break;
            case "timer_alarm":
                timer_alarm = Number(value);
                break;
        }
    }
}

function useDoor(event)
{
    currently_open = currently_open ^ event.target.dataset.door;
    setDoorButtonText(event.target)

    if(armed && !sound && !flash)
    {
        armed = false;
        alarm = true;
        flash = true;
        sound = true;
        timer_alarm = 0;
    }
}

function toggleLock(event)
{
    locked = !locked;
    setLockButtonText(event.target)

    if(!locked)
    {
        armed = false;
        alarm = false;
        sound = false;
        flash = false;
        timer_alarm = 0;
    }
}

function tick(tick=10)
{
    total_time += tick;

    if(!armed && locked && !currently_open)
    {
        timer_armed += tick;
    }

    if(sound || flash)
    {
        timer_alarm += tick;
    }
}

function checkTimers()
{
    if(!locked || currently_open)
    {
        timer_armed = 0;
    }

    if(!armed && timer_armed >= TIME_UNTIL_ARMED)
    {
        armed = true;
        timer_armed = 0;
    }

    if(sound && timer_alarm >= TIME_UNTIL_SOUND_OFF)
    {
        sound = false;
    }

    if(flash && timer_alarm >= TIME_UNTIL_ALARM_OFF)
    {
        flash = false;
        timer_alarm = 0;
    }
}

function updateStateAndTimerDisplay()
{
    if(!currently_open)
    {
        document.getElementById("closed_value").innerText = true.toString();
    }
    else
    {
        document.getElementById("closed_value").innerText = false.toString();
    }

    if(locked)
    {
        document.getElementById("locked_value").innerText = true.toString();
    }
    else
    {
        document.getElementById("locked_value").innerText = false.toString();
    }

    if(armed)
    {
        document.getElementById("armed_value").innerText = true.toString();
    }
    else
    {
        document.getElementById("armed_value").innerText = false.toString();
    }

    if(alarm)
    {
        document.getElementById("alarm_value").innerText = true.toString();
    }
    else
    {
        document.getElementById("alarm_value").innerText = false.toString();
    }

    if(sound)
    {
        document.getElementById("sound_value").innerText = true.toString();
    }
    else
    {
        document.getElementById("sound_value").innerText = false.toString();
    }

    if(flash)
    {
        document.getElementById("flash_value").innerText = true.toString();
    }
    else
    {
        document.getElementById("flash_value").innerText = false.toString();
    }

    document.getElementById("timer_alarm_value").innerText = timer_alarm.toString();
    document.getElementById("timer_armed_value").innerText = timer_armed.toString();
    document.getElementById("total_time").innerText = total_time.toString();

}

function loadPage()
{
    if(armed && (window.location.pathname !== "/CarAlarmSystem_Demo/armed.html"))
    {
        window.location.href = "/CarAlarmSystem_Demo/armed.html";
    }

    if(alarm && (window.location.pathname !== "/CarAlarmSystem_Demo/alarm.html"))
    {
        window.location.href = "/CarAlarmSystem_Demo/alarm.html";
    }

    if(!alarm && !armed && (window.location.pathname !== "/CarAlarmSystem_Demo/index.html"))
    {
        window.location.href = "/CarAlarmSystem_Demo/index.html";
    }
}

<!--STEP-->
function handleButtonClick(event)
{
    if(event.target.matches("door_button"))
    {
        useDoor(event);
    }
    else if(event.target.matches("lock_button"))
    {
        toggleLock(event);
    }
    else
    {
        tick();
    }

    checkTimers();
    updateStateAndTimerDisplay();
    storeCookies();
    loadPage();
}

function setDoorButtonText(button)
{
    const is_door_open = currently_open & button.dataset.door;

    if(is_door_open)
    {
        button.textContent = button.dataset.text_close;
    }
    else
    {
        button.textContent = button.dataset.text_open;
    }
}

function setLockButtonText(button)
{
    if(locked)
    {
        button.textContent = button.dataset.text_unlock;
    }
    else
    {
        button.textContent = button.dataset.text_lock;
    }
}

function setButtonText(button)
{
    if(button.matches("door_button"))
    {
        setDoorButtonText(button);
    }
    else if(button.matches("lock_button"))
    {
        setLockButtonText(button)
    }
}

function setup()
{
    loadCookies();
    for (let i =0; i < buttons.length; i++)
    {
        setButtonText(buttons[i]);
        buttons[i].addEventListener("click", handleButtonClick);
    }
    checkTimers();
    updateStateAndTimerDisplay();
}


setup()