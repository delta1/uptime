var ctx = document.getElementById("chart").getContext("2d");

function makeGraph(data) {
	const dateFormat = "DD-MMM-YYYY HH:mm:ss ZZ";
	const logs = data.map(datetime =>
		moment(datetime, dateFormat).startOf("minute")
	);

	const now = moment().startOf("minute");
	const fourHoursAgo = now.clone().subtract(4, "hours");
	const twentyFourHoursAgo = now.clone().subtract(24, "hours");

	const filtered = logs.filter(log => log.isAfter(twentyFourHoursAgo));
	const uptime = ((100 * filtered.length) / 1440).toFixed(0);
	document.querySelector("#uptime").innerText = `${uptime}%`;

	const tickData = [];
	const pointBackgroundColors = [];
	for (var i = 1; i <= 240; i++) {
		const tick = fourHoursAgo.clone().add(i, "minutes");
		const found = logs.find(log => log.isSame(tick));
		tickData.push({
			t: tick.valueOf(),
			y: found ? 1 : 0
		});
		pointBackgroundColors.push(found ? "#00AA11" : "#AA0000");
	}

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
