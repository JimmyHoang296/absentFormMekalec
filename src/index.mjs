var submitBtn = document.getElementById("submitBtn");
var loginBtn = document.getElementById("login");
var modal = document.getElementById("modal");
var form = document.querySelector(".form-container");
var loginForm = document.querySelector(".login");
var modal = document.querySelector(".modal");
var caution = document.querySelector(".caution");
var emp;
const URL =
  "https://script.google.com/macros/s/AKfycbxPiJ44J2MbjbmRSXjrjPvD4T-wceo-0D9ZtA6j5Z6WEgZSRRx83kuvte-a8pywK7mI/exec";
// this is sample data
// var emp = { empId: 'e001',
//               empName: 'John',
//               empEmail: 'amor.laala@gmail.com',
//               department: '',
//               position: '',
//               managerName: 'Steven',
//               managerEmail: 'support@mekalec.com',
//               status: '',
//               dayIn: '',
//               annualLeaveTotal: 30,
//               annualLeaveRemain: 12 }

function renderData() {
  const empName = document.getElementById("empName");
  const annualLeaveTotal = document.getElementById("annualLeaveTotal");
  const annualLeaveRemain = document.getElementById("annualLeaveRemain");

  empName.innerText = `Employee: ${emp.empName}`;
  annualLeaveTotal.innerText = `Annual leave total: ${emp.annualLeaveTotal}`;
  annualLeaveRemain.innerText = `Annual leave remain: ${emp.annualLeaveRemain}`;
}
// renderData()

loginBtn.addEventListener("click", () => {
  var userName = document.getElementById("userName");
  var password = document.getElementById("password");
  var errMsg = document.getElementById("errMsg");
  // validataion
  if (userName.value === "" || password.value === "") {
    errMsg.innerText = "Input username and password";
    showEle(errMsg);
    return;
  }

  // handlelogin
  handleLogin(userName.value, password.value);
});

function handleLogin(userName, password) {
  showEle(modal);
  var submitData = { type: "login", data: { userName, password } };
  console.log(submitData);
  fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(submitData), // body data type must match "Content-Type" header
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.status) {
        emp = data.empData;
        showEle(form);
        hidEle(loginForm);
        hidEle(modal);
        handleSuccessLogin(emp);
      } else {
        var errMsg = document.getElementById("errMsg");
        errMsg.innerHTML = "wrong user or password";
        showEle(errMsg);
        hidEle(modal);
      }
    });
}
function hidEle(element) {
  element.classList.add("hidden");
}

function showEle(element) {
  element.classList.remove("hidden");
}
function handleSuccessLogin(data) {
  var empName = document.getElementById("empName");
  var annualLeaveTotal = document.getElementById("annualLeaveTotal");
  var annualLeaveRemain = document.getElementById("annualLeaveRemain");
  empName.innerText = "Employee " + data.empName;
  annualLeaveTotal.innerText = "Total annual leave: " + data.annualLeaveTotal;
  annualLeaveRemain.innerText =
    "Remain annual leave: " + data.annualLeaveRemain;
}
var startDateEle = document.getElementById("startDate");
var endDateEle = document.getElementById("endDate");

startDateEle.addEventListener("input", () => {
  handleInput();
});
endDateEle.addEventListener("input", () => {
  handleInput();
});

function handleInput() {
  var startDate = document.getElementById("startDate").value;
  var endDate = document.getElementById("endDate").value;
  var leaveType = document.getElementById("leaveType").value;
  var leaveDaysEle = document.getElementById("leaveDays");
  var caution = document.getElementById("caution");
  caution.innerText = "";

  if (compareDates(new Date(), startDate) === 1) {
    caution.innerText = "Start leave can not be in the past";
    leaveDaysEle.innerText = "";
    return false;
  }

  // check if start date is newer
  if (compareDates(startDate, endDate) === 1) {
    caution.innerText = "Your end date is before start date";
    leaveDaysEle.innerText = "";
    return false;
  }

  if (startDate !== "" && endDate !== "") {
    var leaveDays = calculateDateGapExcludingWeekends(startDate, endDate);
    console.log(leaveDays > emp.annualLeaveRemain);
    if (leaveType === "Annual leave" && leaveDays > emp.annualLeaveRemain * 1) {
      caution.innerText =
        "The number of your requested leave days exceeds the available paid leave balance";
      leaveDaysEle.innerText = "";
      return false;
    } else {
      leaveDaysEle.innerText = "Leave Days: " + leaveDays;
    }
  }

  // if too long need to follow rule
  var gapToday = calculateDateGap(new Date(), startDate);
  if (leaveType === "Annual leave") {
    if (
      (leaveDays < 6 && gapToday < 7) ||
      (leaveDays > 5 && leaveDays < 16 && gapToday < 28) ||
      (leaveDays > 15 && gapToday < 84)
    ) {
      caution.innerText =
        "Requesting leave later than the specified regulations.";
    }
  }
}

submitBtn.addEventListener("click", () => {
  handleSubmit();
});

function handleSubmit() {
  var startDate = document.getElementById("startDate").value;
  var endDate = document.getElementById("endDate").value;
  var leaveType = document.getElementById("leaveType").value;
  var leaveNote = document.getElementById("leaveNote").value;
  var caution = document.getElementById("caution");

  var empId = emp.empId;
  var empName = emp.empName;
  var managerName = emp.managerName;
  if (startDate === "" || endDate === "" || leaveType === "") {
    alert("Missing data");
    return;
  }
  // check if start date is newer
  if (compareDates(startDate, endDate) === 1) {
    caution.innerText = "Your end date is before start date";
    alert("Cannot submit. Your end date is before start date");
    return;
  }
  if (compareDates(new Date(), startDate) === 1) {
    caution.innerText = "Start leave can not be in the past";
    alert("Cannot submit. Start leave can not be in the past");
    return;
  }

  var leaveDays = calculateDateGapExcludingWeekends(startDate, endDate);

  if (leaveType === "Annual leave" && leaveDays > emp.annualLeaveRemain) {
    caution.innerText =
      "The number of your requested leave days exceeds the available paid leave balance";
    alert(
      "Cannot submit. The number of your requested leave days exceeds the available paid leave balance",
    );
    return;
  }

  showEle(modal);
  var submitData = {
    type: "submit",
    data: {
      empId,
      empName,
      startDate,
      endDate,
      leaveDays,
      leaveType,
      leaveNote,
      caution: caution.innerText,
      managerName,
    },
  };

  fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(submitData), // body data type must match "Content-Type" header
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.status) {
        hidEle(modal);
        document.querySelector(".form-container").innerHTML =
          "<h2>Your request has been submitted successfully</h2>";
      } else {
        // case fail
      }
    });
}

function compareDates(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (d1 < d2) {
    return -1;
  } else if (d1 > d2) {
    return 1;
  } else {
    return 0;
  }
}
function calculateDateGapExcludingWeekends(startDate, endDate) {
  // Convert input strings to date objects
  var start = new Date(startDate);
  var end = new Date(endDate);

  // Calculate the number of days between the two dates
  var days = 1 + Math.floor((end - start) / (24 * 60 * 60 * 1000));

  // Adjust for weekends
  var weekends = 0;
  for (var i = 0; i <= days; i++) {
    var currentDate = new Date(start);

    currentDate.setDate(start.getDate() + i);
    var dayOfWeek = currentDate.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekends++;
    }
  }
  var adjustedDays = days - weekends;

  return adjustedDays;
}

function calculateDateGap(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const timeDifference = Math.abs(d1 - d2);
  const daysDifference = Math.floor(timeDifference / oneDay);

  return daysDifference;
}
