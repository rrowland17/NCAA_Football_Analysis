// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

// When the browser loads, makeResponsive() is called.
makeResponsive();

// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    // var svgWidth = window.innerWidth;
    // var svgHeight = window.innerHeight;

    var svgWidth = 960;
    var svgHeight = 500;

    var margin = {
        top: 40,
        right: 40,
        bottom: 80,
        left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "yards_per_pass_attempt";
    var chosenYAxis = "total_points";

    // function used for updating x-scale var upon click on axis label
    function xScale(demoData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(demoData, d => d[chosenXAxis]) * 0.8,
            d3.max(demoData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);

        return xLinearScale;
    }

    // function used for updating y-scale var upon click on axis label
    function yScale(demoData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(demoData, d => d[chosenYAxis]) * 0.8,
            d3.max(demoData, d => d[chosenYAxis]) * 1.2
            ])
            .range([height, 0]);

        return yLinearScale;
    }

    // function used for updating xAxis var upon click on axis label
    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    // function used for updating yAxis var upon click on axis label
    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles when clicking on new axis
    function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));
        return circlesGroup;
    }

    // function used for updating the text in the circles group with a transition to
    // new circles when clicking on new axis
    function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
        textGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis])+6);
        return textGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, textGroup) {

        if (chosenXAxis === "yards_per_pass_attempt") {
            var xlabel = "Yards Per Pass Attempt:";
        }
        else if (chosenXAxis === "passing_touchdowns") {
            var xlabel = "Passing Touchdowns:";
        }
        else {
            var xlabel = "Rushing Touchdowns:";
        }

        if (chosenYAxis === "total_points") {
            var ylabel = "Total Points:";
        }
        else if (chosenYAxis === "total_touchdowns") {
            var ylabel = "Total Touchdowns: ";
        }
        else {
            var ylabel = "Total Offensive Plays:";
        }

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function(d) {
            return (`${d.variable}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
            });

        textGroup.call(toolTip);

        textGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
            // onmouseout event
            .on("mouseout", function(data, index) {
            toolTip.hide(data);
            });

        return textGroup;
    }

    // Import Data
    var file = "static/data/clean_team_stats.csv"
    d3.csv(file).then(successHandle, errorHandle);

    function errorHandle(error){
        throw err;
    }

    function successHandle(demoData) {

        // Step 1: Parse Data/Cast as numbers
        // ==============================
        demoData.forEach(function(data) {
            data.yards_per_pass_attempt = +data.yards_per_pass_attempt;
            data.total_points = +data.total_points;
            data.passing_touchdowns = +data.passing_touchdowns;
            data.rushing_touchdowns = +data.rushing_touchdowns;
            data.total_offensive_plays = +data.total_offensive_plays;
            data.total_touchdowns = +data.total_touchdowns;
        });

        // Step 2: Create scale functions
        // ==============================
        var xLinearScale = xScale(demoData, chosenXAxis);
        var yLinearScale = yScale(demoData, chosenYAxis);

        // Step 3: Create axis functions
        // ==============================
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Step 4: Append Axes to the chart
        // ==============================
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        // Step 5: Create Circles
        // ==============================
        var circlesGroup = chartGroup.selectAll("circle")
            .data(demoData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", "20")
            .attr("fill", "brown")
            .attr("opacity", ".75");

        var textGroup = chartGroup.selectAll(".label")
            .data(demoData)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .text(function(d) {return d.abbr;})
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis])+6)
            .attr("fill", "white")
            .attr("font-family","sans-serif");


        // Create group for 3 y-axis labels
        var ylabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)")
            .attr("class", "axisText")
            .attr("x", 0 - (height / 2))
            .style("text-anchor", "middle");

        var total_offensive_playsLabel = ylabelsGroup.append("text")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "total_offensive_plays")
            .classed("inactive", true)
            .attr("dy", "1em")
            .text("Total Offensive Plays");

        var total_touchdownsLabel = ylabelsGroup.append("text")
            .attr("y", 20 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "total_touchdowns")
            .classed("inactive", true)
            .attr("dy", "1em")
            .text("Total Touchdowns");

        var total_pointsLabel = ylabelsGroup.append("text")
            .attr("y", 40 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "total_points")
            .classed("active", true)
            .attr("dy", "1em")
            .text("Total Points");

        // Create group for 3 x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var yards_per_pass_attemptLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "yards_per_pass_attempt")
            .classed("active", true)
            .text("Yards Per Pass Attempt");

        var passing_touchdownsLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "passing_touchdowns")
            .classed("inactive", true)
            .text("Passing Touchdowns");

        var rushing_touchdownsLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "rushing_touchdowns")
            .classed("inactive", true)
            .text("Rushing Touchdowns");

        // updateToolTip function above csv import
        var textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

        // x axis labels event listener
        xlabelsGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            var xvalue = d3.select(this).attr("value");
            if (xvalue !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = xvalue;

            // updates x scale for new data
            xLinearScale = xScale(demoData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates text in circles with new x values
            textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

            // changes classes to change bold text
            if (chosenXAxis === "yards_per_pass_attempt") {
                yards_per_pass_attemptLabel
                    .classed("active", true)
                    .classed("inactive", false);
                passing_touchdownsLabel
                    .classed("active", false)
                    .classed("inactive", true);
                rushing_touchdownsLabel
                    .classed("active", false)
                    .classed("inactive", true);
            
            }
            else if (chosenXAxis === "passing_touchdowns") {
                yards_per_pass_attemptLabel
                    .classed("active", false)
                    .classed("inactive", true);
                passing_touchdownsLabel
                    .classed("active", true)
                    .classed("inactive", false);
                rushing_touchdownsLabel
                    .classed("active", false)
                    .classed("inactive", true);
            
            }
            else {
                yards_per_pass_attemptLabel
                    .classed("active", false)
                    .classed("inactive", true);
                passing_touchdownsLabel
                    .classed("active", false)
                    .classed("inactive", true);
                rushing_touchdownsLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
            }
        });
        // y axis labels event listener
        ylabelsGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            var yvalue = d3.select(this).attr("value");
            if (yvalue !== chosenYAxis) {

            // replaces chosenYAxis with value
            chosenYAxis = yvalue;

            // updates y scale for new data
            yLinearScale = yScale(demoData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates text in circles with new y values
            textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            text = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

            // changes classes to change bold text
            if (chosenYAxis === "total_offensive_plays") {
                total_offensive_playsLabel
                    .classed("active", true)
                    .classed("inactive", false);
                total_touchdownsLabel
                    .classed("active", false)
                    .classed("inactive", true);
                total_pointsLabel
                    .classed("active", false)
                    .classed("inactive", true);
            
            }
            else if (chosenYAxis === "total_touchdowns") {
                total_offensive_playsLabel
                    .classed("active", false)
                    .classed("inactive", true);
                total_touchdownsLabel
                    .classed("active", true)
                    .classed("inactive", false);
                total_pointsLabel
                    .classed("active", false)
                    .classed("inactive", true);
            
            }
            else {
                total_offensive_playsLabel
                    .classed("active", false)
                    .classed("inactive", true);
                total_touchdownsLabel
                    .classed("active", false)
                    .classed("inactive", true);
                total_pointsLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
            }
        });
    }
}
