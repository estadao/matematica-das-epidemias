// Based on https://bl.ocks.org/denjn5/6914f73f8bc3f009a875fa2bd11f81d8
// and https://bl.ocks.org/mbostock/1667139

function draw(disease) {

  d3.json(`../output/${disease}.json`).then(function(datapoints) {
  // Load the data, then do the following...

    // Set the dimensions
    let margin = { top: 10, left: 10, right: 10, bottom: 10},
        height = 300 - margin.top - margin.bottom,
        width = 300 - margin.left - margin.right;

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

    // Define a stratify utility to create an hierarchy
    let stratify = d3.stratify()
          .id(d => d.id)
          .parentId(d => d.parent);

    // Stratify the data
    datapoints = stratify(datapoints);

    // Set up the hierarchy
    let root = d3.hierarchy(datapoints);
    let nodes = root.descendants();
    let links = root.links();

    // Declare d3 layout and stop it
    let simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).distance(1))
        .force('charge', d3.forceManyBody().distanceMax(20))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .stop();

    d3.timeout(function() {

    // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
      simulation.tick();
    }

    // Add the elements
    // let lines = svg.selectAll('line')
    //              .data(links)
    //              .enter()
    //              .append('line')
    //              .attr("data-generation", d => d.source.data.data.generation + 1)
    //              .attr('x1', d => d.source.x)
    //              .attr('y1', d => d.source.y)
    //              .attr('x2', d => d.target.x)
    //              .attr('y2', d => d.target.y)
    //              .attr('class', 'hidden')

    let circles = svg.selectAll('circle')
                   .data(nodes)
                   .enter()
                   .append('circle')
                   .attr('r', 0)
                   .attr("data-generation", d => d.data.data.generation)
                   .attr('cx', d => d.x)
                   .attr('cy', d => d.y)
                   .attr("fill", "#ffbaba")
                   .style('stroke-width', '0px')
                   .attr('class', 'hidden')




    // Start revealing the chart, slowly
    // Addapted from https://stackoverflow.com/questions/43382652/d3-set-elements-to-transition-in-order

      // Create circle selections
      let circleGenerations = [ "[data-generation=\"1\"]",
                                "[data-generation=\"2\"]",
                                "[data-generation=\"3\"]",
                                "[data-generation=\"4\"]",
                                "[data-generation=\"5\"]",
                                "[data-generation]" ]


      function repeat() {

        console.log("repeat");

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


    });

  });


}

draw("h1n1");
draw("covid-19");
draw("smallpox");
