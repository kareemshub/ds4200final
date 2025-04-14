
d3.csv('us_foreign_aid_country.csv').then(function(data) {
     // Clean data, convert values to integers
    data.forEach(function(d) {
        d.Fiscal_Year = parseInt(d['Fiscal Year'], 10); 
        d.current_amount = parseInt(d['current_amount'], 10); 
    });

    // Remove data with invalid values 
    data = data.filter(function(d) {
        return d.Fiscal_Year > 0 && d.current_amount > 0;
    });

    // Set up chart dimensions and SVG container
    var margin = { top: 20, right: 30, bottom: 40, left: 50 },
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up scales
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLog().range([height, 0]);

    // Create axes
    var xAxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");
    
    var yAxis = svg.append("g")
        .attr("class", "y axis");

    // Tooltip functionality
    var tooltip = d3.select("#tooltip");

    // Region and Time Frame dropdown
    d3.select("#regionSelect").on("change", updateChart);
    d3.select("#timeFrame").on("change", updateChart);

    // Update the chart based on region and time frame
    function updateChart() {
        var selectedRegion = d3.select("#regionSelect").property("value");
        var selectedTimeFrame = d3.select("#timeFrame").property("value");

        // Filter data based on selected region
        var filteredData = data.filter(function(d) {
            if (selectedRegion === 'MENA') {
                return d['Region Name'] === 'Middle East and North Africa';
            } else if (selectedRegion === 'SubSaharan') {
                return d['Region Name'] === 'Sub-Saharan Africa';
            }
        });

        // Filter data based on selected time frame
        if (selectedTimeFrame === '2000-2010') {
            filteredData = filteredData.filter(function(d) {
                return d.Fiscal_Year >= 2000 && d.Fiscal_Year <= 2010;
            });
        } else if (selectedTimeFrame === '2010-2020') {
            filteredData = filteredData.filter(function(d) {
                return d.Fiscal_Year >= 2010 && d.Fiscal_Year <= 2020;
            });
        }

        // Update the scales based on filtered data
        x.domain([d3.min(filteredData, function(d) { return d.Fiscal_Year; }), d3.max(filteredData, function(d) { return d.Fiscal_Year; })]);
        y.domain([d3.min(filteredData, function(d) { return d.current_amount; }), d3.max(filteredData, function(d) { return d.current_amount; })]);

        // Update axes
        xAxis.transition().duration(500).call(d3.axisBottom(x));
        yAxis.transition().duration(500).call(d3.axisLeft(y));

        // Bind data and create circles for points
        var circles = svg.selectAll("circle").data(filteredData);

        circles.exit().remove();  // Remove old points

        circles.enter().append("circle")
            .attr("cx", function(d) { return x(d.Fiscal_Year); })
            .attr("cy", function(d) { return y(d.current_amount); })
            .attr("r", 5)
            .style("fill", "#FF6347") // Assign a single color (Tomato red for both regions)
            .style("opacity", 0.7)
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "red");
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(d['Region Name'] + ": " + d['Fiscal Year'] + " - " + d['current_amount'])
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).style("fill", "#FF6347"); // Reset to Tomato red color
                tooltip.transition().duration(500).style("opacity", 0);
            })
            .merge(circles)
            .transition().duration(500)
            .attr("cx", function(d) { return x(d.Fiscal_Year); })
            .attr("cy", function(d) { return y(d.current_amount); });
    }

    // Initial chart rendering with all data
    updateChart();
});