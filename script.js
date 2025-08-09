const start_page = "index.html";
const armed_page = "armed.html";
const alarm_page = "alarm.html";

const TIME_UNTIL_ARMED = 20;
const TIME_UNTIL_SOUND_OFF = 30;
const TIME_UNTIL_FLASH_OFF = 300;

const ACTIVE_OPACITY = "1.0";
const INACTIVE_OPACITY = "0.3";
const INVISIBLE_OPACITY = "0.0";

let buttons = document.getElementsByClassName("button")

// STATE
/*front_right_door = 0b1000
  front_left_door =  0b0100
  back_right_door =  0b0010
  back_left_door =   0b0001*/
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

function useDoor(button)
{
    currently_open = currently_open ^ button.dataset.door_bin;
    setDoorButtonText(button)

    if(armed && !sound && !flash)
    {
        armed = false;
        alarm = true;
        flash = true;
        sound = true;
        timer_alarm = 0;
    }
}

function toggleLock(text_lock)
{
    locked = !locked;
    setLockButtonText(text_lock)

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

    if(!alarm && !armed && locked && !currently_open)
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

    if(flash && timer_alarm >= TIME_UNTIL_FLASH_OFF)
    {
        flash = false;
        timer_alarm = 0;
    }
}

function updateDisplay()
{
    document.getElementById("car_img").src = "img/" + currently_open.toString(2).padStart(4, '0') + ".png";

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
        document.getElementById("locked_img").style.opacity = ACTIVE_OPACITY;
    }
    else
    {
        document.getElementById("locked_value").innerText = false.toString();
        document.getElementById("locked_img").style.opacity = INACTIVE_OPACITY;
    }

    if(armed)
    {
        document.getElementById("armed_value").innerText = true.toString();
        document.getElementById("armed_img").style.opacity = ACTIVE_OPACITY;
    }
    else
    {
        document.getElementById("armed_value").innerText = false.toString();
        document.getElementById("armed_img").style.opacity = INACTIVE_OPACITY;
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
        document.getElementById("sound_img").style.opacity = ACTIVE_OPACITY;
    }
    else
    {
        document.getElementById("sound_value").innerText = false.toString();
        document.getElementById("sound_img").style.opacity = INACTIVE_OPACITY;
    }

    if(flash)
    {
        document.getElementById("flash_value").innerText = true.toString();
        document.getElementById("flash_img").style.opacity = ACTIVE_OPACITY;
    }
    else
    {
        document.getElementById("flash_value").innerText = false.toString();
        document.getElementById("flash_img").style.opacity = INACTIVE_OPACITY;
    }

    document.getElementById("timer_alarm_value").innerText = timer_alarm.toString();
    document.getElementById("timer_armed_value").innerText = timer_armed.toString();
    document.getElementById("total_time").innerText = total_time.toString();

    if(!locked || currently_open || armed || alarm)
    {
        document.getElementById("timer_armed").style.opacity = INVISIBLE_OPACITY;
    }
    else
    {
        document.getElementById("timer_armed").style.opacity = ACTIVE_OPACITY;
    }

    if(flash || sound)
    {
        document.getElementById("timer_alarm").style.opacity = ACTIVE_OPACITY;
    }
    else
    {
        document.getElementById("timer_alarm").style.opacity = INVISIBLE_OPACITY;
    }

}

function loadPage()
{
    const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "");

    if(armed && (!window.location.pathname.endsWith(`/armed.html`)))
    {
        window.location.href = `${base}/armed.html`;
    }

    if(alarm && (!window.location.pathname.endsWith(`/alarm.html`)))
    {
        window.location.href = `${base}/alarm.html`;
    }

    if(!alarm && !armed && (!window.location.pathname.endsWith(`/index.html`)))
    {
        window.location.href = `${base}/index.html`;
    }
}

<!--STEP-->
function handleButtonClick(id)
{
    let element = document.getElementById(id);
    if(element.dataset.door_bin)
    {
        useDoor(element);
    }
    else if(element.dataset.text_lock)
    {
        toggleLock(element);
    }
    else
    {
        tick();
    }

    checkTimers();
    updateDisplay();
    storeCookies();
    loadPage();
}

function setDoorButtonText(button)
{
    const is_door_open = currently_open & button.dataset.door_bin;

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
    if(button.dataset.door_bin)
    {
        setDoorButtonText(button);
    }
    else if(button.dataset.text_lock)
    {
        setLockButtonText(button)
    }
}

function initializeDisplay()
{
    document.getElementById("timer_alarm_threshold").innerText = TIME_UNTIL_FLASH_OFF.toString();
    document.getElementById("timer_armed_threshold").innerText = TIME_UNTIL_ARMED.toString();
    updateDisplay();
}

function setup()
{
    loadCookies();
    loadPage();
    for (let i =0; i < buttons.length; i++)
    {
        setButtonText(buttons[i]);
    }
    checkTimers();
    initializeDisplay();
}


setup()