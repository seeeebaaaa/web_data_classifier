//-jhint options
/*jshint unused:true,leanswitch:true,asi:true,esversion:8,expr:true,-W008*/


/**
 * Converts a csv-formatted string to and array with datapoints (and parses to float), if special is true, then returns special points too [in sperate array]
 * @param {*} input 
 * @param {*} special
 * @returns array with datapoints
 * @returns special?[datapoints, specialpoints]
 */
function dataFromCsvString(input, special = false) {
    let raw_data = input.split(/\n/gm)
    let final_data = []
    let final_special = []
    for (const dataPoint of raw_data) {
        dataPoint.trim()
        if (dataPoint[0] == "/" || dataPoint[0] == undefined) {
            //read comment
            continue;
        }
        if (dataPoint[0] == "%") {
            // read special point
            final_special.push(dataPoint.substr(1).split(/[,]/gm).map(parseFloat))
            continue;
        }
        const coords = dataPoint.split(/[,]/gm).map(parseFloat)

        final_data.push(coords)
    }
    if (special) {
        return [final_data, final_special]
    } else {
        return final_data
    }
}

/**
 * @returns ranom hexcolor
 */
function randomHexColor() {
    let color = "#" + Math.floor(Math.random() * 16777215).toString(16)
    while (color.length <= 6) {
        color += 0
    }
    return color
}

/**
 * Initilizes the last column of data to -1 or does nothing, if it isnt a class
 * @param {*} data 
 * @returns 
 */
function set_last_column_to_minus_one(data) {
    if (modify_options.is_last_row_class) {
        for (const [index, entry] of data.entries()) {
            data[index][entry.length - 1] = -1
        }
    } else {
        for (const [index, entry] of data.entries()) {
            data[index][entry.length] = -1
        }
    }
    return data
}

function removeClass(data) {
    if (modify_options.is_last_row_class) {
        for (const [index, entry] of data.entries()) {
            data[index].pop()
        }
    }
    return data
}

/**
 * Outputs data to the target
 * @param {*} target 
 * @param {*} data 
 */
function outputCsvData(target, data, special = false, addition = "") {
    target.value = "";
    for (const entry of data) {
        let counter = -1
        if (special) {
            target.value += "%"
        }
        for (const coord of entry) {
            counter++;
            target.value += coord + ((counter == entry.length - 1) ? "" : ",")
        }
        if (addition != "") {
            target.value += "," + addition
        }
        target.value += "\n"
    }
    target.dispatchEvent(new Event("change"))
}

/**
 * Returns random int between 0 and max-1
 * @param {*} max 
 * @returns 
 */
function randomInt(max) {
    return Math.floor(Math.random() * max)
}

/**
 * Calculates manhattan distacne between two data points
 * @param {*} data_point_1
 * @param {*} data_point_2 
 * @returns 
 */
function distance_manhattan(data_point_1, data_point_2) {
    let aggr_distance = 0
    for (const [dimension, data_point_value] of data_point_1.entries()) {
        aggr_distance += Math.abs(data_point_value - data_point_2[dimension])
    }
    // console.log("Calculated distance: ", aggr_distance);
    return aggr_distance
}

/**
 * Calculates SQUARED euklidian distance between two data points
 * @param {*} data_point_1
 * @param {*} data_point_2 
 * @returns 
 */
function distance_euklidian(data_point_1, data_point_2) {
    let aggr_distance = 0
    for (const [dimension, data_point_value] of data_point_1.entries()) {
        // aggr_distance = exactMath.add(aggr_distance, (exactMath.pow(exactMath.sub(data_point_value, data_point_2[dimension]), 2)))
        aggr_distance += (data_point_value - data_point_2[dimension]) ** 2
    }
    return aggr_distance
}

/**
 * Calculates distance between two points
 * @param {*} data_point_1 
 * @param {*} data_point_2 
 * @param {*} distance_type 
 * @returns 
 */
function getDistances(data_point_1, data_point_2, distance_type) {
    switch (distance_type) {
        case "manhattan":
            return distance_manhattan(data_point_1, data_point_2)
        case "euklidian":
            return distance_euklidian(data_point_1, data_point_2)
        default:
            console.error("Sth went rwongg!");
            break;
    }
}

function arrray_include(data, el) {
    for (const d_el of data) {
        let a = 0
        for (const [i, dim] of d_el.entries()) {
            if (el[i] == dim) {
                a++;
            }
        }
        if (a == d_el.length) {
            return true
        }
    }
    return false
}

/**
 * Seperates doubles into an extern data, assuming last index of point is class
 * @param {*} data 
 * @returns 
 */
function remove_doubles(data) {
    let result_data = [], result_doubles = []
    for (const el of data) {
        if (!arrray_include(result_data, el)) {
            result_data.push(el)
        } else {
            result_doubles.push(el)
        }
    }

    console.log('result_doubles: ', result_doubles);
    console.log('result_data: ', result_data);
    return [result_data, result_doubles]
}

/***
 * Asisgns clustered classes to all doubles and adds them to the data,, assuming last index of point is class
 */
function parse_doubles(data, doubles) {
    let result = JSON.parse(JSON.stringify(data))
    for (const el of doubles) {
        const el_nc = el.slice(0, -1)
        const class_el = data.find(el => {
            for (const _el of el.slice(0, -1).entries()) {
                if (_el[1] != el_nc[_el[0]]) {
                    return false
                }
            } return true
        })
        result.push(class_el)
    }
    return result
}

function printMatrix(matrix) {
    let output = ""
    for (const el of matrix) {
        output += "\n"
        for (const _el of el) {
            output += Math.round(_el * 100) / 100 + " "
        }
    }
    console.log(output);
}