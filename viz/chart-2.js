// Based on https://bl.ocks.org/denjn5/6914f73f8bc3f009a875fa2bd11f81d8
// and https://bl.ocks.org/mbostock/1667139

// To do: draw all the dataviz at once

// To do: compute positions externally so we don't need to
// pre-process the data before adding it to the page

function isMobile() {
    /*
    This function detects if the screen
    of the device is mobile (width smaller than
    800). It returns `true`` if positive,
    `false` if negative.
    */
    if(window.innerWidth <= 800) {

       return true;

    } // End of if

    else {

       return false;

    } // End of else

} // End of isMobile()

function draw(diseases) {

    Promise.all([

        d3.json(`${diseases[0]}-pre-processed.json`),
        d3.json(`${diseases[1]}-pre-processed.json`),
        d3.json(`${diseases[2]}-pre-processed.json`),

        ]).then(function(datasets) {

    // Load the data, then do the following...

        // First, set the chart dimensions
        let margin = { top: 10, left: 10, right: 10, bottom: 10},
        height = 300 - margin.top - margin.bottom,
        width = 300 - margin.left - margin.right;
        
        // For each one of the diseases
        for (let [ index, disease ] of diseases.entries()) {
        
            // Select the relevant data
            var datapoints = datasets[index];

            // For this chart, we won't need all of those
            // smallpox/measles points. This will enhance animation
            // performance.
            if (disease == "smallpox") {
                datapoints = datapoints.filter(function(d){
                    return d.generation <= 2;
                })
            }

            if (disease == "measles") {
                datapoints = datapoints.filter(function(d){
                    return d.generation <= 3;
                })

                console.log(datapoints);
            }
            
            // Creates the svg
            let svg = d3.select(`#${disease}`)
                .append("svg")
                .attr("height", height + margin.top + margin.bottom)
                .attr("width", width + margin.left + margin.right)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
            // Apends a border
            svg.append("rect")
                .attr("fill", "none")
                .attr("stroke", "#000")
                .attr("stroke-width", .4)
                .attr("opacity", 1)
                .attr("width", width)
                .attr("height", height)
        
            // Add the elements        
            let circles = svg.selectAll('circle')
                            .data(datapoints)
                            .enter()
                            .append('circle')
                            .attr('r', 0)
                            .attr("data-generation", d => d.generation)
                            .attr("data-disease", d => d.virusName.toLowerCase())
                            .attr('cx', d => d.cx)
                            .attr('cy', d => d.cy)
                            .attr("fill", "#ffbaba")
                            .style('stroke-width', '0px')
                            .attr('class', 'hidden')
        
                // Compute a day count and reveal the circles when
                // the day is a multiple of their serial interval
                let serialInterval = null;
                if (disease == "covid-19") {
                    serialInterval = 4;
                } 
                else if (disease == "h1n1") {
                    serialInterval = 3;
                }
                else if (disease == "measles") {
                    serialInterval = 12;
                }
                else if (disease == "smallpox") {
                    serialInterval = 18;
                }

                function repeat() {

                    let maxDays = 30;
                    let generation = 0;
                    let repeatTrigger = true;

                    for (let day = 0; day <= maxDays; day++) {

                        // Set the day placeholder to one
                        d3.selectAll(".day-count")
                            .html(`Dia 1`)

                        // For every day of the simulation, wait a second
                        setTimeout(function() {

                            // Update the day count ONLY ONCE
                            // to avoid rollbacks caused by asyncronicity. 
                            // We will use the Covid-19 count to update them.
                            if ((disease == "covid-19") & (day > 1)) {

                                d3.selectAll(".day-count")
                                    .html(`Dia ${day}`)

                            }
                            
                            // If the serialInterval has passed, start the infection
                            if (day % serialInterval == 0) {

                                console.log("Day", day, "is infection day!")
                                // Increment the generations
                                generation +=  1;

                                var currentGeneration = `[data-generation=\"${generation}\"][data-disease="${disease}"]`
                                console.log(currentGeneration);

                                // Reveal it!

                                // If it's the first generation, do it very quickly
                                if (generation == 1) {

                                    var circles = d3.selectAll(currentGeneration)
                                    .transition().duration(0).delay(0)
                                    .attr("r", 4)
                                    .style('stroke-width', '2px')
                                    .style("fill", "#ffbaba")
                                    .style("opacity", 1)
                                    .attr("class", "active")
                                    .transition().duration(500)
                                    .attr("r", 3)
                                    .style('stroke-width', '0px')
                                    .transition().duration(500)
                                    .style("fill", "#aeaeee")
                                    .attr("class", "inactive")

                                }

                                // Else, take your time
                                else {

                                    var circles = d3.selectAll(currentGeneration)
                                    .transition().duration(500).delay(1000)
                                    .attr("r", 4)
                                    .style('stroke-width', '2px')
                                    .style("fill", "#ffbaba")
                                    .style("opacity", 1)
                                    .attr("class", "active")
                                    .transition().duration(500)
                                    .attr("r", 3)
                                    .style('stroke-width', '0px')
                                    .transition().duration(500)
                                    .style("fill", "#aeaeee")
                                    .attr("class", "inactive");

                                }


                            }

                            // When the day count is over, wait a bit then remove the circles
                            if (day == maxDays) {

                                d3.selectAll(`[data-generation][data-disease="${disease}"]`)
                                    .transition().duration(500).delay(1200)
                                    .style("opacity", 0)
                                    .attr("class", "hidden")
                                    .on("end", function() {
                                    
                                    // Call the repeat function only once
                                    if (repeatTrigger) {
                                        repeatTrigger = false;
                                        repeat();
                                    }
                    
                                    })
                                }

                        }, 1500 * day);
                        
                    }

                }

                repeat();
        

        
        }
  
    });

  }

draw([ "covid-19", "h1n1", "measles" ]);
