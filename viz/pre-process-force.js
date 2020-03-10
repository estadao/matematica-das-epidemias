/* This script uses d3.js force package to compute
coordinates for the elements in our charts. By doing this,
we can simply load the pre-processed data in our other functions,
without computing the same thing again and again and again
every time we load the page */


// Taken from https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

Promise.all([

    d3.json(`../output/covid-19.json`),
    d3.json(`../output/h1n1.json`),
    //d3.json(`../output/smallpox.json`),
    d3.json(`../output/measles.json`),
    d3.json(`../output/hypothetic-r0-0.5.json`),
    d3.json(`../output/hypothetic-r0-1.5.json`)

]).then(function(datapointsCollection) {

    for (let [index, datapoints] of datapointsCollection.entries()) {


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

        // Set the future chart dimensions
        let margin = { top: 10, left: 10, right: 10, bottom: 10},
            height = 300 - margin.top - margin.bottom,
            width = 300 - margin.left - margin.right;

        var distanceMax = 20;
            if (index == 3) { // Measles
                distanceMax = 5;
            }
        
        // Declare d3 layout and stop it
        let simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).distance(1))
            .force('charge', d3.forceManyBody().distanceMax(distanceMax))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .stop();

        // Run the simulation

        for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();

        }

        // Parse the output to keep only what we need
        let outputData = [ ]

        for (let node of nodes) {

            var newNode = { }
            
            newNode.cx = node.x;
            newNode.cy = node.y;
            newNode.id = node.data.data.id;
            newNode.generation = node.data.data.generation;
            newNode.virusName = node.data.data.virus_name;
            newNode.alive = node.data.data.alive;
            
            outputData.push(newNode);
            
        }

        // Show me the output
        // console.log(outputData);

        // Save it
        let filename = ""

        if (index == 0) {

            filename = "covid-19-pre-processed.json"

        }

        else if (index == 1) {

            filename = "h1n1-pre-processed.json"

        }

        else if (index == 2) {

            filename = "smallpox-pre-processed.json"

        }

        else if (index == 3) {

            filename = "measles-pre-processed.json"

        }

        else if (index == 4) {

          filename = "r0-0.5-pre-processed.json"

        }

        else if (index == 5) {

          filename = "r0-1.5-pre-processed.json"

        }

        else if (index == 6) {

          filename = "r0-constant-pre-processed.json"

        }

        outputData = JSON.stringify(outputData);
        download(outputData, filename, 'text-plain')
        
    }

});