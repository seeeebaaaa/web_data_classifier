//-jhint options
/*jshint unused:true,leanswitch:true,asi:true,esversion:8,expr:true,-W008*/


const kmeans_options = {
    cluster_count: 1,
    distance_type: "manhattan",
    max_iterations: 100,
    auto_centroids: false,
    gif_length: 5000
}

let kmeans_iteterations = [] // [[[data],[centroids]],[...]]

/**
 * Returns a html-table inner body caontianing the kmeans options
 * @returns 
 */
function kmeans_getOptionTable() {
    let output = "";
    const option_data = [
        {
            name: "<label for='kmeans_cluster_count'>Cluster Count</label>",
            input: "<input name='kmeans_cluster_count' type='number' class='number-input' id='kmeans_cluster_count' min='1' value='1' steps='1' onchange='kmeans_oninput_options(this)'>"
        },
        {
            name: "<label for='kmeans-distance'>Distance Type</label>",
            input: '<select name="kmeans-distance" id="kmeans_distance" class="select-input" onchange="kmeans_oninput_options(this)"><option value="manhattan" selected="selected">Manhattan</option><option value="euklidian">Euklidian</option></select>'
        },
        {
            name: "<label for='kmeans-max-iterations'>Max. Iterations</label>",
            input: "<input name='kmeans-max-iterations' type='number' class='number-input' id='kmeans_max_iterations' min='1' value='100' steps='1' onchange='kmeans_oninput_options(this)'>"
        },
        {
            name: "<label for='kmeans_auto_centroids'>Auto add Centroids to data?</label>",
            input: '<label class="checkbox-input-container"><input type="checkbox" id="kmeans_auto_centroids" name="kmeans_auto_centroids" onchange="kmeans_oninput_options(this)"><span class="check"></span></label>'
        },
        {
            name: "<label for='kmeans_modifiy'>Press to modify</label>",
            input: '<input type="button" value="Modify" name="kmeans_modifiy" onclick="kmeans_modifiy()">'
        },
        {
            name: "<label for='kmeans_iterate'>Show Iteration Nr.</label>",
            input: '<input id="kmeans_iterate" type="number" value="1" name="kmeans_iterate" onchange="kmeans_oninput_options(this)" min="0">'
        },
        {
            name: "<label for='kmeans_gif_length'>Gif Length in s</label>",
            input: "<input name='kmeans_gif_length' type='number' class='number-input' id='kmeans_gif_length' min='1' max='60' value='5' steps='1' onchange='kmeans_oninput_options(this)'>"
        },
        {
            name: " <div class='tooltip'><label for='kmeans_download_as_gif'>Download as GIF</label><span class='tooltiptext'>If the gif doenst download, google 'how to disable Cross-Origin Restrictions <i>YourBrowser</i>' or 'disable the same-origin policy <i>YourBrowser</i>'</span></div > ",
            input: '<input type="button" class="save" value="Download" name="kmeans_download_as_gif" onclick="kmeans_download_as_gif()">'
        },
        {
            name: "<label for='kmeans_centroids'>Centroids</label>",
            input: '<textarea cols="15" rows="1" name="kmeans_centroids" id="kmeans_centroids" disabled>-</textarea>'
        }
    ]
    for (const option of option_data) {
        output += "<tr>"
        output += "<td>"
        output += option.name
        output += "</td>"
        output += "<td>"
        output += option.input
        output += "</td>"
        output += "</tr>"
    }
    return output
}

/**
 * Handley value change on attached elements
 * @param {*} element 
 * @returns 
 */
function kmeans_oninput_options(element) {
    switch (element.name) {
        case "kmeans_cluster_count":
            kmeans_options.cluster_count = element.value
            return
        case "kmeans-max-iterations":
            kmeans_options.max_iterations = element.value
            return
        case "kmeans-distance":
            kmeans_options.distance_type = element.value
            return
        case "kmeans_iterate":
            kmeans_showIterateStep(element.value)
            return
        case "kmeans_auto_centroids":
            kmeans_options.auto_centroids = element.checked
            return
        case "kmeans_gif_length":
            kmeans_options.gif_length = element.value * 1000
            return
        default:
            console.log("sth wentr wrooong");
            break;
    }
}

/**
 * Gets the data from t1 or f1, already as array
 * @returns 
 */
async function kmeans_getData() {
    if (data_1_last_edit == "text") {
        return dataFromCsvString(text_data_input_1.value)
    } else {
        let file = file_data_input_1.files[0]
        let content = await new Promise((resolve) => {
            let file_reader = new FileReader()
            file_reader.readAsText(file, "UTF-8")
            file_reader.onload = (e) => {
                resolve(file_reader.result)
            }
        })
        let data = dataFromCsvString(content)
        data.shift()
        return data
    }
}


/**
 * Displays a specific iterations step
 * @param {*} step 
 */
function kmeans_showIterateStep(step) {
    let element = document.getElementById("kmeans_iterate")
    outputCsvData(text_data_input_2, kmeans_iteterations[step][0])
    kmeans_showCentroids(kmeans_iteterations[step][1])
    kmeans_addCentroids(kmeans_iteterations[step][1])
}

/**
 * Sets the iterare input to max iterations
 */
function kmeans_setStepCounter() {
    let element = document.getElementById("kmeans_iterate")
    element.value = kmeans_iteterations.length - 1
    element.max = kmeans_iteterations.length - 1
}

/**
 * Create and download gif
 * @returns 
 */
function kmeans_download_as_gif() {
    /**
    * Gif obj 
     */
    let gif = new GIF({
        workerScript: "extern/gif.worker.js",
        workers: 2,
        quality: 1,
        background: "#fff",
        transparent: 0xFFFFFF
    });
    // download gif, once rendered
    gif.on('finished', function (blob) {
        saveAs(blob, "img.gif");
    });
    const steps = kmeans_iteterations.length
    console.log('steps: ', steps);
    if (steps < 0) return
    const canvas = $("#plot_container_2 canvas")[0]
    for (let i = 0; i < steps; i++) {
        kmeans_showIterateStep(i)
        gif.addFrame(canvas, { copy: true, delay: parseInt(kmeans_options.gif_length / steps) })
    }
    gif.render()
}

/**
 * Displayes centroids
 * @param {*} centroids 
 */
function kmeans_showCentroids(centroids) {
    const area = document.getElementById("kmeans_centroids")
    outputCsvData(area, centroids, true)
    area.value = "// Centroids Start\n" + area.value + "// Centroids End\n"
}

/**
 * Adds centroids from centroid ouput to t2, if option is set
 * @param {*} centroids 
 */
function kmeans_addCentroids(centroids) {
    const area = document.getElementById("kmeans_centroids")
    if (kmeans_options.auto_centroids) {
        text_data_input_2.value = "// Centroids are added at the end\n" + text_data_input_2.value + area.value
    }
    text_data_input_2.dispatchEvent(new Event("change"))
}

/**
 * handles input, clustering and output
 */
async function kmeans_modifiy() {
    kmeans_iteterations = []
    let raw_data = await kmeans_getData()
    //initialize class
    raw_data = set_last_column_to_minus_one(raw_data)
    let [data, doubles] = remove_doubles(raw_data)
    console.log('data: ', data);


    const [modified_data, centroids] = kmeans_cluster(data, kmeans_options.cluster_count, kmeans_options.distance_type, kmeans_options.max_iterations)
    outputCsvData(text_data_input_2, parse_doubles(modified_data, doubles))
    kmeans_setStepCounter(modified_data)
    kmeans_showCentroids(centroids)
    kmeans_addCentroids(centroids)
}

/**
 * Kmeans cluster algorithm
 * @param {*} data 
 * @param {*} cluster_count 
 * @param {*} distance_type 
 */
function kmeans_cluster(data, cluster_count, distance_type, max_iterations) {
    let centroids = []
    let old_data
    centroids = kmeans_setFirstCentroids(data, cluster_count)
    let i = 0
    do {
        i++
        console.log("ITERATION: ", i);
        old_data = JSON.parse(JSON.stringify(data))
        kmeans_iteterations.push([old_data, centroids]) // save iteration step for visualizing
        data = kmeans_calculateNewAssignment(data, centroids, distance_type)
        centroids = kmeans_calculateNewCentroids(data, cluster_count)
    } while (JSON.stringify(old_data) != JSON.stringify(data) && max_iterations-- > 0)
    return [data, centroids]
}

/**
 * Returns frist array of centroids
 * @param {*} data 
 * @param {*} cluster_count 
 */
function kmeans_setFirstCentroids(data, cluster_count) {
    let picked_points = [] // contains entrys of picked points
    for (; cluster_count > 0; cluster_count--) {
        let temp_point
        let max = 100000;
        do {
            temp_point = data[randomInt(data.length)]
            max--
            if (max == 0) {
                console.error("AHHHH");
                return
            }
        } while (arrray_include(picked_points, temp_point))
        picked_points.push(temp_point)
        console.table(picked_points);

    }
    console.table(picked_points);
    return picked_points
}


/**
 * Returns data with new assignment, based on given clusters
 * @param {*} data 
 * @param {*} centroids 
 */
function kmeans_calculateNewAssignment(data, centroids, distance_type) {
    for (const [index, entry] of data.entries()) {
        let distances = [] // holds distances to each cluster
        for (let centroid_number = 0; centroid_number < centroids.length; centroid_number++) {
            distances[centroid_number] = getDistances(entry.slice(0, -1), centroids[centroid_number], distance_type)
        }
        let nearest_centroid_index = distances.indexOf(Math.min(...distances))
        data[index][entry.length - 1] = nearest_centroid_index
    }
    return data
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
function kmeans_calculateNewCentroids(data, cluster_count) {
    let elementsInCluster = []
    let positions = []
    // intialize with 0
    for (let b = 0; b < cluster_count; b++) {
        elementsInCluster[b] = 0
        positions.push([])
        for (let a = 0; a < data[0].length - 1; a++) {
            positions[b][a] = 0
        }
    }
    //aggr distaances
    for (const [index, entry] of data.entries()) {
        elementsInCluster[entry[entry.length - 1]]++ // count how much elements are in each cluster
        for (const [coord_index, coord] of entry.slice(0, -1).entries()) {
            positions[entry[entry.length - 1]][coord_index] += coord //entry.length-1
        }
    }
    //divide and write in centroids
    for (const [pos_index, centroid_pos] of positions.entries()) {
        for (const [coord_index, coord] of centroid_pos.entries()) {
            positions[pos_index][coord_index] = coord / elementsInCluster[pos_index]
        }
    }

    console.log('positions: ', positions);
    return positions
}