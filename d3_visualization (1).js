d3.csv('us_foreign_aid_country.csv').then(function(data) {
    // Parse and clean
    data.forEach(function(d) {
        d.Fiscal_Year = parseInt(d['Fiscal Year'], 10); 
        d.current_amount = parseInt(d['current_amount'], 10); 
    });

    // Filter out invalid data
    data = data.filter(d => d.Fiscal_Year > 0 && d.current_amount > 0);

    // Region example mapping
    const regionExamples = {
        "Middle East and North Africa": ["Egypt", "Jordan", "Lebanon"],
        "Sub-Saharan Africa": ["Nigeria", "Kenya", "Ethiopia"],
        "Other": ["Cambodia", "Laos", "Fiji"]
    };

    // Chart setup
    var margin = { top: 20, right: 30, bottom: 60, left: 70 },
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scales
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLog().range([height, 0]);

    var xAxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");

    var yAxis = svg.append("g")
        .attr("class", "y axis");

    // Axis labels
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2 + 50)
        .attr("y", height + 45)
        .attr("class", "axis-label")
        .text("Fiscal Year");

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -55)
        .attr("x", -height / 2 + 20)
        .attr("class", "axis-label")
        .text("Aid Amount (USD, Log Scale)");

    var tooltip = d3.select("#tooltip");

    // Dropdown listeners
    d3.select("#regionSelect").on("change", updateChart);
    d3.select("#timeFrame").on("change", updateChart);

    function updateChart() {
        var selectedRegion = d3.select("#regionSelect").property("value");
        var selectedTimeFrame = d3.select("#timeFrame").property("value");

        // Filter by region
        var filteredData = data.filter(function(d) {
            if (selectedRegion === 'MENA') {
                return d['Region Name'] === 'Middle East and North Africa';
            } else if (selectedRegion === 'SubSaharan') {
                return d['Region Name'] === 'Sub-Saharan Africa';
            }
        });

        // Filter by time
        if (selectedTimeFrame === '2000-2010') {
            filteredData = filteredData.filter(d => d.Fiscal_Year >= 2000 && d.Fiscal_Year <= 2010);
        } else if (selectedTimeFrame === '2010-2020') {
            filteredData = filteredData.filter(d => d.Fiscal_Year >= 2010 && d.Fiscal_Year <= 2020);
        }

        // Scale domains
        x.domain(d3.extent(filteredData, d => d.Fiscal_Year));
        y.domain([
            d3.min(filteredData, d => d.current_amount),
            d3.max(filteredData, d => d.current_amount)
        ]);

        // Axes
        xAxis.transition().duration(500).call(d3.axisBottom(x).tickFormat(d3.format("d")));
        yAxis.transition().duration(500).call(d3.axisLeft(y).ticks(10, "~s"));

        // Bind data
        var circles = svg.selectAll("circle").data(filteredData, d => d.Fiscal_Year + d.current_amount);

        circles.exit().remove();

        circles.enter().append("circle")
            .attr("r", 5)
            .attr("cx", d => x(d.Fiscal_Year))
            .attr("cy", d => y(d.current_amount))
            .style("fill", d => d['Region Name'] === 'Middle East and North Africa' ? "#1f77b4" : "#ff7f0e")
            .style("opacity", 0.7)
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "red");
                const region = d['Region Name'];
                const examples = regionExamples[region] ? `<br><i>Examples: ${regionExamples[region].join(", ")}</i>` : "";
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(`${region}<br>${d['Fiscal Year']} - $${d3.format(",")(d['current_amount'])}${examples}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                d3.select(this).style("fill", d => d['Region Name'] === 'Middle East and North Africa' ? "#1f77b4" : "#ff7f0e");
                tooltip.transition().duration(500).style("opacity", 0);
            })
            .merge(circles)
            .transition().duration(500)
            .attr("cx", d => x(d.Fiscal_Year))
            .attr("cy", d => y(d.current_amount));
    }

    updateChart();
});
