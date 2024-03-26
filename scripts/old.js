var currentWeek = 2;

function days() {
    const week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const nodes = document.getElementsByClassName('day-box');
    for (var i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.getElementsByClassName("weekday").item(0).innerHTML = week[i];
        node.getElementsByClassName("number").item(0).innerHTML = (i + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    }
}

function color(node) {
    node.style.borderStyle = "solid";
    switch (node.getElementsByClassName("sub").item(0).innerHTML) {
    case "Ropes Course":
        node.style.borderColor = "#2980b9";
        break;
    case "Laser Tag":
        node.style.borderColor = "#f1c40f";
        break;
    case "Go-Karts":
        node.style.borderColor = "#e74c3c";
        break;
    case "Shift Lead":
        node.style.borderColor = "#8e44ad";
        break;
    default:
        console.log(node.getElementsByClassName("name").item(0).innerHTML);
    }
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

function newShift(week, day, name, pos, time) {
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
    
    shift.appendChild(details);
    color(shift);
    const box = d.getElementsByClassName('shifts')[day];
    box.appendChild(shift);
    shift.classList.add('week'+week);
}

async function loadData(week) {
    const response = await fetch("data/shifts.csv", {cache: "no-store"});
    const data = await response.text();
    const csv = await import("./../libraries/csv/index.js");
    const parsed = csv.parse(data);
    for (var item of parsed) {
        if (item[0] == week) {
            newShift(item[0], item[1], item[2], item[3], item[4]);
        }
    }
}

function clearData() {
    for (var day of document.getElementsByClassName('shifts')) {
        day.innerHTML = '';
    }
}

function cover() {
    for (var day of document.getElementsByClassName('day-box')) {
        var cover = day.children[1].cloneNode(true);
        day.appendChild(cover);
        cover.style.flex = "0 0 800px";
        cover.classList = 'cover';
    }
}

async function nxt() {
    currentWeek++;
    cover();
    clearData();
    await loadData(currentWeek);
    for (var day of document.getElementsByClassName('day-box')) {
        day.removeChild(day.children[2]);
    }
}

async function prv() {
    currentWeek--;
    cover();
    clearData();
    await loadData(currentWeek);
    for (var day of document.getElementsByClassName('day-box')) {
        day.removeChild(day.children[2]);
    }
}

function load() {
    daybox();
    days();
    loadData(currentWeek);
}

window.onload = load();
