// get the canvas context for chart.js
var ctx = document.getElementById("chart").getContext("2d");

function makeGraph(data) {
  // parse the log data into a new array of momentjs objects
  // rounded off to the start of the minute
  const dateFormat = "DD-MMM-YYYY HH:mm:ss ZZ";
  const logs = data.map(datetime =>
    moment(datetime, dateFormat).startOf("minute")
  );

  const now = moment().startOf("minute");
  const fourHoursAgo = now.clone().subtract(4, "hours");
  const twentyFourHoursAgo = now.clone().subtract(24, "hours");

  // calculate the 24 hour uptime
  // count the number of entries in the logs array since 24 hours ago
  // and convert it to a percentage of the number of minutes (1440)
  const filtered = logs.filter(log => log.isAfter(twentyFourHoursAgo));
  const uptime = ((100 * filtered.length) / 1440).toFixed(0);
  document.querySelector("#uptime").innerText = `${uptime}%`;

  // generate the graph data for the past 4 hours (240 mins)
  const tickData = [];
  const pointBackgroundColors = [];
  for (var i = 1; i <= 240; i++) {
    const tick = fourHoursAgo.clone().add(i, "minutes");
    // check if the current tick exists in the logs array
    const found = logs.find(log => log.isSame(tick));
    // if it was found then the log was received at that time
    // so set the y value to 1 for "on"
    // and make the color green
    tickData.push({
      t: tick.valueOf(),
      y: found ? 1 : 0
    });
    pointBackgroundColors.push(found ? "#00AA11" : "#AA0000");
  }

  // create the graph using chart.js
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Uptime",
          backgroundColor: "#00AA11",
          borderColor: "white",
          steppedLine: true,
          pointBackgroundColor: pointBackgroundColors,
          data: tickData
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Time"
            },
            type: "time",
            distribution: "series",
            ticks: {
              source: "tickData",
              autoSkip: true
            }
          }
        ],
        yAxes: [
          {
            min: 0,
            max: 1,
            ticks: {
              beginAtZero: true,
              stepSize: 1,
              callback: value => (value > 0 ? "ON" : "OFF")
            }
          }
        ]
      }
    }
  });

  return chart;
}

// 1440.json is generated from the apache access logs
// when report.cgi page is processed
const getData = async file => {
  const response = await fetch(file);
  let data = [];
  if (response.ok) {
    data = await response.json();
  } else {
    console.error("Response error!", response.status, response);
  }
  return data;
};

getData("1440.json").then(data => makeGraph(data));
