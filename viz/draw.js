// Based on https://bl.ocks.org/denjn5/6914f73f8bc3f009a875fa2bd11f81d8
// and https://bl.ocks.org/mbostock/1667139

function draw(diseases) {

    Promise.all([

        d3.json(`${diseases[0]}-pre-processed.json`),
        d3.json(`${diseases[1]}-pre-processed.json`),
        d3.json(`${diseases[2]}-pre-processed.json`),

    ]).then(function(datasets) {

        function drawBaseNumber() {
            /* Draws the charts that display
            how the base reproductivity number 
            (r0) work */

            // Set the dimensions
            let margin = { top: 5, left: 5, right: 5, bottom: 5},
            height = 330 - margin.top - margin.bottom,
            width = 330 - margin.left - margin.right;

            // Then, for each disease...
            for (let [ index, disease ] of diseases.entries()) {

                // Select the data
                var datapoints = datasets[index];

                // Create the svg
                let svg = d3.select(`#${disease}-base-number`)
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

                // Add the visualization elements
                let circles = svg.selectAll('[data-chart-type="base-number"]')
                    .data(datapoints)
                    .enter()
                    .append('circle')
                    .attr('r', 0)
                    .attr("data-generation", d => d.generation)
                    .attr("data-disease", d => d.virusName.toLowerCase())
                    .attr("data-chart-type", "base-number")
                    .attr('cx', d => d.cx)
                    .attr('cy', d => d.cy)
                    .attr("fill", "#ffbaba")
                    .style('stroke-width', '0px')
                    .attr('class', 'hidden')

                // Start revealing the chart, slowly
                // Addapted from https://stackoverflow.com/questions/43382652/d3-set-elements-to-transition-in-order

                // Create circle selections
                let circleGenerations = [ 
                    "[data-generation=\"1\"][data-chart-type=\"base-number\"]",
                    "[data-generation=\"2\"][data-chart-type=\"base-number\"]",
                    "[data-generation=\"3\"][data-chart-type=\"base-number\"]",
                    "[data-generation=\"4\"][data-chart-type=\"base-number\"]",
                    "[data-generation][data-chart-type=\"base-number\"]" 
                ]

                function repeat() {
                    
                    for (let i = 0 ; i < circleGenerations.length; i++) {

                            currentGeneration = circleGenerations[i];

                            // Update the generation count after a fixed timeout,
                            // allowing time for the d3 transitions to finish
                            let repeatTrigger = true;
                        
                            if (currentGeneration != "[data-generation][data-chart-type=\"base-number\"]") {
                        

                                let counterTrigger = true;

                                // Update the circles
                                let selectedCircles = d3.selectAll(currentGeneration)
                                    .transition().duration(500).delay(i * 1500)
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
                                    .on("start", function() {

                                        if (counterTrigger) {

                                            // Update the generation and infection counters
                                            counterTrigger = false;
                                            d3.selectAll(".gen-count")
                                                .html(`${i + 1}ª geração`)


                                        }

                                    });
            
                            }
                        
                            else {

                                let counterTrigger = true;
                            
                                let selecedCircles = d3.selectAll(currentGeneration)
                                    .transition().duration(1000).delay(i * 1700)
                                    .style("opacity", 0)
                                    .attr("class", "hidden")
                                    .on("end", function() {

                                        if (counterTrigger) {

                                            // Update the generation counter
                                            counterTrigger = false;
                                            d3.selectAll(".gen-count")
                                                .html("1ª geração")

                                        }
                                        
                                        // Call the repeat function only once
                                        if (repeatTrigger) {
                                            repeatTrigger = false;
                                            repeat();
                                        }
                            
                                    })
    
                            }
    

                            
                    
                    }
                
                }

                repeat();

            }


        }

        function drawSerialInterval() {
            /* Draws the chart that brings
            the concept of serial interval into
            the mix */

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

                }
            
                // Creates the svg
                let svg = d3.select(`#${disease}-serial-interval`)
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
                let circles = svg.selectAll('.circle-serial-interval')
                                .data(datapoints)
                                .enter()
                                .append('circle')
                                .attr('r', 0)
                                .attr("data-generation", d => d.generation)
                                .attr("data-disease", d => d.virusName.toLowerCase())
                                .attr("data-chart-type", "serial-interval")
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

                                // Increment the generations
                                generation +=  1;

                                var currentGeneration = `[data-generation=\"${generation}\"][data-disease="${disease}"][data-chart-type=\"serial-interval\"]`

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
                                        .attr("class", "inactive");
                                }

                                // Else, take your time
                                else {

                                    let counterTrigger = true;

                                    var circles = d3.selectAll(currentGeneration)
                                        .transition().duration(250).delay(500)
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
                                        .on("end", function() {

                                            // Updates the generation count
                                            if (counterTrigger) {

                                                counterTrigger = false;
                                                let holder = d3.select(`.gen-count-si.${disease}`)
                                                            .html(`${generation}ª geração`)
                                            }


                                        });
    
                                }


                            }

                            // When the day count is over, wait a bit then remove the circles
                            if (day == maxDays) {

                                let counterTrigger = true;

                                d3.selectAll(`[data-generation][data-disease="${disease}"][data-chart-type=\"serial-interval\"]`)
                                    .transition().duration(250).delay(700)
                                    .style("opacity", 0)
                                    .attr("class", "hidden")
                                    .on("end", function() {

                                        // Updates the generation count
                                        if (counterTrigger) {

                                            counterTrigger = false;
                                            let holder = d3.select(`.gen-count-si.${disease}`)
                                                        .html("1ª geração")
                                        }

                                        // Call the repeat function only once
                                        if (repeatTrigger) {
                                            repeatTrigger = false;
                                            repeat();
                                        }
                    
                                })
                            }

                        }, 750 * day);
                        
                    }

                }

                repeat();
        

        
            }

        }

        function drawCaseFatalityRatio() {
            /* Draws the chart that brings
            the concept of case fatality ratio
            into the mix */

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

                }
            
                // Creates the svg
                let svg = d3.select(`#${disease}-cfr`)
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
                let circles = svg.selectAll('.circle-cfr')
                                .data(datapoints)
                                .enter()
                                .append('circle')
                                .attr('r', 0)
                                .attr("data-generation", d => d.generation)
                                .attr("data-disease", d => d.virusName.toLowerCase())
                                .attr("data-chart-type", "cfr")
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

                                // Increment the generations
                                generation +=  1;

                                var currentGeneration = `[data-generation=\"${generation}\"][data-disease="${disease}"][data-chart-type=\"cfr\"]`

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
                                        .style("fill", function(d) {
                                          
                                            // If this person survived, paint it purple
                                            if (d.alive) {

                                                return "#aeaeee"
                                            }

                                            else {

                                                // Else, paint it red
                                                return "#a3240d";

                                            }

                                        })
                                        .attr("class", "inactive");
                                }

                                // Else, take your time
                                else {

                                    let counterTrigger = true;

                                    var circles = d3.selectAll(currentGeneration)
                                        .transition().duration(250).delay(500)
                                        .attr("r", 4)
                                        .style('stroke-width', '2px')
                                        .style("fill", "#ffbaba")
                                        .style("opacity", 1)
                                        .attr("class", "active")
                                        .transition().duration(500)
                                        .attr("r", 3)
                                        .style('stroke-width', '0px')
                                        .transition().duration(500)
                                        .style("fill", function(d) {
                                          
                                            // If this person survived, paint it purple
                                            if (d.alive) {

                                                return "#aeaeee";

                                            }

                                            else {

                                                // Else, paint it red
                                                return "#a3240d";

                                            }

                                        })
                                        .attr("class", "inactive")
                                        .on("end", function() {

                                            // Updates the generation count
                                            if (counterTrigger) {

                                                counterTrigger = false;
                                                let holder = d3.select(`.gen-count-cfr.${disease}`)
                                                            .html(`${generation}ª geração`)
                                            }


                                        });
    
                                }


                            }

                            // When the day count is over, wait a bit then remove the circles
                            if (day == maxDays) {

                                let counterTrigger = true;

                                d3.selectAll(`[data-generation][data-disease="${disease}"][data-chart-type=\"cfr\"]`)
                                    .transition().duration(250).delay(700)
                                    .style("opacity", 0)
                                    .attr("class", "hidden")
                                    .on("end", function() {

                                        // Updates the generation count
                                        if (counterTrigger) {

                                            counterTrigger = false;
                                            let holder = d3.select(`.gen-count-cfr.${disease}`)
                                                        .html("1ª geração")
                                        }

                                        // Call the repeat function only once
                                        if (repeatTrigger) {
                                            repeatTrigger = false;
                                            repeat();
                                        }
                    
                                })
                            }

                        }, 750 * day);
                        
                    }

                }

                repeat();
        

        
            }

        }

        drawBaseNumber();

        drawSerialInterval();

        drawCaseFatalityRatio();

    });
  
}
  
draw([ "covid-19", "h1n1", "measles" ]);
