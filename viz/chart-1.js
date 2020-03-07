// Based on https://bl.ocks.org/denjn5/6914f73f8bc3f009a875fa2bd11f81d8
// and https://bl.ocks.org/mbostock/1667139

function draw(diseases) {

    Promise.all([

        d3.json(`${diseases[0]}-pre-processed.json`),
        d3.json(`${diseases[1]}-pre-processed.json`),
        d3.json(`${diseases[2]}-pre-processed.json`),

    ]).then(function(datasets) {

        // Set the dimensions
        let margin = { top: 5, left: 5, right: 5, bottom: 5},
            height = 300 - margin.top - margin.bottom,
            width = 300 - margin.left - margin.right;

        // Then, for each disease...
        for (let [ index, disease ] of diseases.entries()) {

            // Select the data
            var datapoints = datasets[index];

            // Create the svg
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

            // Start revealing the chart, slowly
            // Addapted from https://stackoverflow.com/questions/43382652/d3-set-elements-to-transition-in-order

            // Create circle selections
            let circleGenerations = [ 
                "[data-generation=\"1\"]",
                "[data-generation=\"2\"]",
                "[data-generation=\"3\"]",
                "[data-generation=\"4\"]",
                "[data-generation]" 
            ]

            function repeat() {
                
                for (let i = 0 ; i < circleGenerations.length; i++) {
                
                    currentGeneration = circleGenerations[i];
                
                    let repeatTrigger = true;
                
                    if (currentGeneration != "[data-generation]") {
                
                        d3.selectAll(currentGeneration)
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
                            .attr("class", "inactive");
                
                    }
                
                    else {
                    
                        d3.selectAll(currentGeneration)
                            .transition().duration(1000).delay(i * 1700)
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

                }
                  
            }

            repeat();

        }
    
    });
  
}
  
draw([ "covid-19", "h1n1", "measles" ]);
