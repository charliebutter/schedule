"use strict";

var sleepSetTimeout_ctrl;
const currentDate = new Date();
var currentPage = currentDate;
const twoDig = new Intl.NumberFormat('en-US', {minimumIntegerDigits: 2, useGrouping:false});
const mmdd = new Intl.DateTimeFormat('default', { month: 'short', day: 'numeric'});
var highlighted = '';

function sleep(ms) {
    clearInterval(sleepSetTimeout_ctrl);
    return new Promise(resolve => sleepSetTimeout_ctrl = setTimeout(resolve, ms));
}

function setUpDate(date) {
    const start = mmdd.format(dateFns.startOfWeek(date, { weekStartsOn: 1 }));
    const end = mmdd.format(dateFns.endOfWeek(date, { weekStartsOn: 1 }));
    document.getElementById("date").innerHTML = `${start} - ${end}`;
    const week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const days = document.getElementsByClassName('day-box');
    for (var i = 0; i < days.length; i++) {
        const day = days[i];
        day.getElementsByClassName("weekday")[0].innerHTML = week[i];
        const start = dateFns.startOfWeek(date, { weekStartsOn: 1 });
        var num = day.getElementsByClassName("number")[0];
        num.innerHTML = dateFns.addDays(start, i).getDate();
    }
}

function color(node) {
    node.style.borderStyle = "solid";
    var color;
    switch (node.getElementsByClassName("sub").item(0).innerHTML) {
    case "Ropes Course":
        color = "#2980b9";
        break;
    case "Laser Tag":
        color = "#f1c40f";
        break;
    case "Go-Karts":
        color = "#e74c3c";
        break;
    case "Shift Lead":
        color = "#8e44ad";
        break;
    default:
        console.log(node.getElementsByClassName("name").item(0).innerHTML);
        color = "var(--dark)";
        break;
    }
    node.children[1].style.backgroundColor = color;
    node.style.borderColor = color;
    node.style.borderLeftWidth = "20px";
    node.style.borderBottomWidth = "0px";
    node.style.borderRightWidth = "0px";
    node.style.borderTopWidth = "0px";
}

function daybox() {
    const d = document;
    const nodes = d.getElementsByClassName('day-box');
    for (var db of nodes) {
        const label = d.createElement("div");
        label.className = "label locked";

        const weekday = d.createElement("p");
        weekday.className = "weekday";
        const node = d.createTextNode("");
        weekday.appendChild(node);

        const tab = d.createElement("div");
        tab.className = "tab";
        const left = d.createElement("div");
        left.className = "l hole";
        const right = d.createElement("div");
        right.className = "r hole";
        const num = d.createElement("div");
        num.className = "number";

        const shifts = d.createElement("div");
        shifts.className = "shifts";

        db.appendChild(label);
        label.appendChild(tab);
        tab.appendChild(left);
        tab.appendChild(right);
        tab.appendChild(num);
        label.appendChild(weekday);
        db.appendChild(shifts).scrollTop = 0;;
    }
}

function newShift(day, name, pos, time) {
    const d = document;

    const shift = d.createElement("div");
    shift.className = "shift";

    const details = d.createElement("div");
    details.className = "details";

    const head = d.createElement("p");
    head.className = "name";
    head.appendChild(d.createTextNode(name));
    details.appendChild(head);
    const sub1 = d.createElement("p");
    sub1.className = "sub";
    sub1.appendChild(d.createTextNode(pos));
    details.appendChild(sub1);
    const sub2 = d.createElement("p");
    sub2.className = "sub";
    sub2.appendChild(d.createTextNode(time));
    details.appendChild(sub2);

    const cover = document.createElement("div");
    cover.className = "cover"; 

    shift.appendChild(details);   
    shift.appendChild(cover);

    color(shift);

    const shifts = d.getElementsByClassName('shifts')[day];
    shifts.appendChild(shift);

    shift.classList.add('animate__animated', 'animate__zoomIn');
    shift.setAttribute('onclick', "highlight(false, this.getElementsByClassName('name')[0].innerHTML)");

    return shift;
}

async function loadData() {
    for (var day of document.getElementsByClassName('shifts')) {
        day.innerHTML = '';
    }
    const response = await fetch("data/shifts.csv", {cache: "no-store"});
    const data = await response.text();
    const parsed = Papa.parse(data)['data'];
    for (var item of parsed) {
        var itemDate = new Date(currentDate.getFullYear(), item[0]-1, item[1]);
        var itemDateNextYear = dateFns.addYears(itemDate, 1);
        if (dateFns.isSameWeek(itemDate, currentPage, { weekStartsOn: 1 })) {
            newShift(dateFns.getISODay(itemDate)-1, item[2], item[3], item[4]);
        } else if (dateFns.isSameWeek(itemDateNextYear, currentPage, { weekStartsOn: 1 })) {
            newShift(dateFns.getISODay(itemDateNextYear)-1, item[2], item[3], item[4]);
        }
    }
    const covers = document.getElementsByClassName('cover');
    for (var cover of covers) {
        cover.classList.add('slide');
    }
    orderShifts();
}

function clearData() {
    const shifts = document.getElementsByClassName('shift');
    for (var shift of shifts) {
        shift.classList.add('animate__zoomOut');
    }
}

function formatTime(timeRange) {
    var start = timeRange.split('-')[0];
    var end = timeRange.split('-')[1];
    var sMin = "00";
    if (start.split(':')[1] != undefined) {
        var sMin = start.split(':')[1].substring(0,2);
    }
    var sHour = parseInt(start.split(/[AP:]+/)[0]);
    var sHour12 = sHour;
    if ((start.slice(-1) == 'P' && sHour < 12) || (start.slice(-1) == 'A' && sHour == 12)) {
        sHour += 12;
        sHour %= 24;
    }
    sHour = twoDig.format(sHour);

    var eMin = "00";
    if (end.split(':')[1] != undefined) {
        var eMin = end.split(':')[1].substring(0,2);
    }
    var eHour = parseInt(end.split(/[AP:]+/)[0]);
    var eHour12 = eHour;
    if ((end.slice(-1) == 'P' && eHour < 12) || (end.slice(-1) == 'A' && eHour == 12)) {
        eHour += 12;
        eHour %= 24;
    }
    eHour = twoDig.format(eHour);

    var overnight = '01';
    if (Date.parse(`1970T${sHour}:${sMin}`) > Date.parse(`1970T${eHour}:${eMin}`)) {
        overnight = '02';
    }

    return [sHour, sMin, eHour, eMin, `${sHour12}:${sMin}${start.slice(-1)}M -- ${eHour12}:${eMin}${end.slice(-1)}M`, overnight]; // start hour (HH), start min (mm), end hour (HH), end min (mm), prettified string, overnight?
}

function orderShifts() {
    const shifts = document.getElementsByClassName('shift');
    for (var shift of shifts) {
        var time = shift.children[0].children[2].innerHTML;
        var formatted = formatTime(time);
        var s = Date.parse(`1970-01-${formatted[5]}T${formatted[0]}:${formatted[1]}`)/100;
        var e = Date.parse(`1970-01-${formatted[5]}T${formatted[2]}:${formatted[3]}`)/10000;
        shift.style.order = s+e;
        shift.children[0].children[2].innerHTML = formatted[4];
    }
}

async function switchPage(direction) {
    currentPage = direction == 'right' ? dateFns.addWeeks(currentPage, 1) : dateFns.subWeeks(currentPage, 1);
    setUpDate(currentPage);
    clearData();
    await sleep(200);
    await loadData(currentPage);
    highlight(true, highlighted);
}

function highlight(remember, user) {
    var shifts = document.getElementsByClassName("shift");
    for (var shift of shifts) {
        shift.classList.remove("dark");
        if ((remember != (highlighted == '')) && shift.getElementsByClassName("name")[0].innerHTML != user) {
            shift.classList.add("dark");
        }
    }
    highlighted = ((remember != (highlighted == ''))) ? user : '';
}

function load() {

    daybox();
    setUpDate(currentDate);
    loadData(currentPage);
}

window.onload = load();
