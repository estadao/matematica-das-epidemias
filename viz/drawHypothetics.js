// Based on https://bl.ocks.org/denjn5/6914f73f8bc3f009a875fa2bd11f81d8
// and https://bl.ocks.org/mbostock/1667139

function draw(diseases) {

    Promise.all([

        d3.json("r0-1.5-pre-processed.json"),
        d3.json("r0-0.5-pre-processed.json")
    ]).then(function(datasets) {

      function drawHypothetics() {
          /* Draws an hypothetic comparison
          between disease with r0 greater
          and smaller than one */

          // Set the dimensions
          let margin = { top: 5, left: 5, right: 5, bottom: 5},
          height = 330 - margin.top - margin.bottom,
          width = 330 - margin.left - margin.right;

          // Then, for each disease...
          for (let [ index, disease ] of diseases.entries()) {

              // Select the data
              var datapoints = datasets[index];

              console.log(index, disease, datapoints);

              // Create the svg
              let svg = d3.select(`#${disease}-hypothetics`)
                  .append("svg")
                  .attr("height", height + margin.top + margin.bottom)
                  .attr("width", width + margin.left + margin.right)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              console.log(svg)
  
              // Apends a border
              svg.append("rect")
                  .attr("fill", "none")
                  .attr("stroke", "#000")
                  .attr("stroke-width", .4)
                  .attr("opacity", 1)
                  .attr("width", width)
                  .attr("height", height)

              // Add the visualization elements
              let circles = svg.selectAll('[data-chart-type="hypothetic-comparison"]')
                  .data(datapoints)
                  .enter()
                  .append('circle')
                  .attr('r', 0)
                  .attr("data-generation", d => d.generation)
                  .attr("data-disease", d => d.virusName.toLowerCase())
                  .attr("data-chart-type", "hypothetic-comparison")
                  .attr('cx', d => d.cx)
                  .attr('cy', d => d.cy)
                  .attr("fill", "#ffbaba")
                  .style('stroke-width', '0px')
                  .attr('class', 'hidden')

              // Start revealing the chart, slowly
              // Addapted from https://stackoverflow.com/questions/43382652/d3-set-elements-to-transition-in-order

              // Create circle selections
              let circleGenerations = [ 
                  "[data-generation=\"1\"][data-chart-type=\"hypothetic-comparison\"]",
                  "[data-generation=\"2\"][data-chart-type=\"hypothetic-comparison\"]",
                  "[data-generation=\"3\"][data-chart-type=\"hypothetic-comparison\"]",
                  "[data-generation=\"4\"][data-chart-type=\"hypothetic-comparison\"]",
                  "[data-generation][data-chart-type=\"hypothetic-comparison\"]" 
              ]

              function repeat() {
                  
                  for (let i = 0 ; i < circleGenerations.length; i++) {

                          currentGeneration = circleGenerations[i];

                          // Update the generation count after a fixed timeout,
                          // allowing time for the d3 transitions to finish
                          let repeatTrigger = true;
                      
                          if (currentGeneration != "[data-generation][data-chart-type=\"hypothetic-comparison\"]") {
                      

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

    drawHypothetics();


  });
  
}
  
draw(["r0-growth", "r0-die-out"]);
