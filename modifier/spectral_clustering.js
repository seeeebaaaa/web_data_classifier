//-jhint options
/*jshint unused:true,leanswitch:true,asi:true,esversion:8,expr:true,-W008*/

/**
 * TODO:
 * - finsih all cluster steps
 * - REPLACE ALL MATH WITH math.js
 */

/**
 * Spectral Clustering as JS [aka. SC]
 */

math.config({
    number: 'number',      // Default type of number:
    // 'number' (default), 'BigNumber', or 'Fraction'
    precision: 64,            // Number of significant digits for BigNumbers
    epsilon: 1e-60
})

const sc_options = {
    cluster_count: 1,
    reducing_factor: 1,
    distance_type: "manhattan"
}

const sc_roundness = 1000000000000;

/**
 * Returns a html-table inner body caontianing the sc options
 * @returns 
 */
function sc_getOptionTable() {
    let output = "";
    const option_data = [
        {
            name: "<label for='sc_cluster_count'>Cluster Count</label>",
            input: "<input name='sc_cluster_count' type='number' class='number-input' id='sc_cluster_count' min='1' value='1' steps='1' onchange='sc_oninput_options(this)'>"
        },
        {
            name: "<label for='sc_reducing_factor'>Reducing factor</label>",
            input: "<input name='sc_reducing_factor' type='number' class='number-input' id='sc_reducing_factor' min='1' value='1' steps='1' onchange='sc_oninput_options(this)'>"
        },
        {
            name: "<label for='sc-distance'>Distance Type</label>",
            input: '<select name="sc-distance" id="sc_distance" class="select-input" onchange="sc_oninput_options(this)"><option value="manhattan" selected="selected">Manhattan</option><option value="euklidian">Euklidian</option></select>'
        },
        {
            name: "<label for='sc_modifiy'>Press to modify</label>",
            input: '<input type="button" value="Modify" name="sc_modifiy" onclick="sc_modifiy()">'
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
function sc_oninput_options(element) {
    switch (element.name) {
        case "sc_cluster_count":
            sc_options.cluster_count = parseInt(element.value)
            return
        case "sc-distance":
            sc_options.distance_type = element.value
            return
        case "sc_reducing_factor":
            sc_options.reducing_factor = element.value
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
async function sc_getData() {
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
 * handles input, clustering and output
 */
async function sc_modifiy() {
    console.log("Spectral Clustering with clusters:", sc_options.cluster_count);
    let data = await sc_getData()
    console.log('data: ', data);
    const [clustered_data, edges] = sc_cluster(removeClass(data), sc_options.cluster_count)
    outputCsvData(text_data_input_2, clustered_data)
}

function roundd(n, digits) {
    return Math.round(n * digits) / digits
}

/**
 * Clusteres the data with sepctral clustering, based on the sc_options
 * @param {*} data 
 * @param {*} cluster_count 
 */
function sc_cluster(data, cluster_count) {
    // console.log('data: ', data);
    let distance_matrix = sc_getDistanceMatrix(data);
    // console.log("a", distance_matrix);
    // temp : sqrt all distances
    // printMatrix(distance_matrix)
    const reduced_distance_matrix = sc_reduceGraph(distance_matrix, sc_options.reducing_factor, "mutual_knn");
    // console.log('reduced_distance_matrix: ', reduced_distance_matrix);
    // printMatrix(reduced_distance_matrix)
    const diagonal_matrix = sc_getDiagonalMatrix(reduced_distance_matrix);
    // console.log('diagonal_matrix: ', diagonal_matrix);
    // printMatrix(diagonal_matrix)
    const nn_laplace = sc_calculate_nn_laplace(diagonal_matrix, reduced_distance_matrix);
    //console.log('nn_laplace: ', nn_laplace);
    //printMatrix(nn_laplace)
    // const n_rw_laplace = sc_calculate_n_rw_laplace(diagonal_matrix, nn_laplace) // doesnt work because of js
    // console.log('n_rw_laplace: ', n_rw_laplace);
    //test round
    // for (let i = 0; i < nn_laplace[0].length; i++) {
    //     for (let _i = 0; _i < nn_laplace[0].length; _i++) {
    //         nn_laplace[i][_i] = roundd(nn_laplace[i][_i], 1000)
    //     }
    // }
    // const n_rw_laplace = sc_calculate_n_rw_laplace(diagonal_matrix, nn_laplace)
    // for (let i = 0; i < n_rw_laplace[0].length; i++) {
    //     for (let _i = 0; _i < n_rw_laplace[0].length; _i++) {
    //         n_rw_laplace[i][_i] = roundd(n_rw_laplace[i][_i], 1000000)
    //     }
    // }
    // printMatrix(n_rw_laplace)
    // try {
    //     const [_eigenvectors, _eigenvalues] = sc_get_eigens(n_rw_laplace, cluster_count)
    // } catch (err) {
    //     console.log(err);
    //     console.log(err.values);
    //     console.log(err.vectors);
    // }
    // printMatrix(_eigenvectors)

    const [eigenvectors, eigenvalues] = sc_get_eigens(nn_laplace, cluster_count)
    // console.log('eigenvectors: ', eigenvectors);
    // console.log('eigenvalues: ', eigenvalues);
    const eigen_matrix = sc_eigen_to_matrix(eigenvectors)
    // console.log('eigen_matrix: ', eigen_matrix);
    let sorted_with_class = sc_add_class(eigen_matrix)
    // console.log('sorted_with_class: ', sorted_with_class);
    const [clustered_eigenvectors, centroids] = kmeans_cluster(sorted_with_class, cluster_count, sc_options.distance_type, 1000)
    // console.log('centroids: ', centroids);
    // console.log('clustered_eigenvectors: ', clustered_eigenvectors);
    const final_data = sc_set_class_to_Cluster_result(data, clustered_eigenvectors)
    return [final_data, ["edges"]]
}

/**
 * Returns the distance matrix [weighted, not reduced, adjecency matrix]
 * @param {*} data 
 * @returns 
 */
function sc_getDistanceMatrix(data) {
    let distance_matrix = []
    for (const [index, data_point] of data.entries()) {
        distance_matrix.push([])
        for (const [_index, _data_point] of data.entries()) {
            distance_matrix[index][_index] = getDistances(data_point, _data_point, sc_options.distance_type)
        }
    }
    // cause getDistance() returns squared distance, we need to take the root of every distance [can possiibly also be completely skipped]
    for (const [i, e] of distance_matrix.entries()) {
        for (const [_i, _e] of e.entries()) {
            distance_matrix[i][_i] = Math.sqrt(_e)
        }
    }
    return distance_matrix
}

/**
 * Reduces the graph to a mutual knn graph
 * @param {*} distance_matrix 
 * @param {*} cluster_count 
 */
function sc_reduceGraph(distance_matrix, cluster_count, type) {
    switch (type) {
        case "mutual_knn":
            return sc_graph_reduction_mutual_knn(distance_matrix, cluster_count)
        default:
            console.log("Sth wretn wonrgr uwu");
    }

}

/**
 * Reduces the data to a mutual knn graph
 * @param {*} distance_matrix 
 * @param {*} cluster_count 
 * @returns 
 */
function sc_graph_reduction_mutual_knn(distance_matrix, cluster_count) {
    let reduced_matrix = JSON.parse(JSON.stringify(distance_matrix))
    for (const [index, line] of distance_matrix.entries()) {
        let sorted_line_elements = Array.from(line.entries()).sort(([i, a], [_i, b]) => a - b).slice(0, cluster_count)
        for (const element of line.entries()) {
            if (sc_contains_sorted_element(sorted_line_elements, element)) {
                continue;
            }
            reduced_matrix[index][element[0]] = 0;
        }
    }
    console.log('reduced_matrix: ', reduced_matrix);
    reduced_matrix = sc_symmetry(reduced_matrix, "AND")
    return reduced_matrix
}

/**
 * Makes an reduced matrix symmetric via AND [both needed] or OR [only one needed]
 * @param {*} array 
 * @param {*} type 
 */
function sc_symmetry(array, type) {
    let result = JSON.parse(JSON.stringify(array))
    for (let i = 0; i < array[0].length; i++) {
        for (let a = i; a < array[0].length; a++) {
            if (!((array[i][a] == 0 && array[a][i] == 0) || (!(array[i][a] == 0 || array[a][i] == 0)))) {
                if (type == "AND") {
                    result[i][a] = 0;
                    result[a][i] = 0;
                } else {
                    array[i][a] > array[a][i] ? result[a][i] = array[i][a] : result[i][a] = array[a][i]
                }
            }
        }
    }
    return result
}

/**
 * Returns wether or not an sorted line array contains another element
 * @param {*} sorted_line_elements 
 * @param {*} element 
 * @returns 
 */
function sc_contains_sorted_element(sorted_line_elements, element) {
    for (const el of sorted_line_elements) {
        if (el[0] == element[0] && el[1] == element[1]) {
            return true
        }
    }
    return false
}

/**
 * Creates the diagonal/degree matrix, containing the line degrees on the main diagonal
 * @param {*} distance_matrix 
 * @returns 
 */
function sc_getDiagonalMatrix(distance_matrix) {
    let result = []
    for (let a = 0; a < distance_matrix.length; a++) {
        result.push([])
        for (let b = 0; b < distance_matrix.length; b++) {
            result[a][b] = 0;
        }
    }
    for (const line of distance_matrix.entries()) {
        for (const element of line[1]) {
            result[line[0]][line[0]] += element
        }
        // result[line[0]][line[0]] = Math.round(result[line[0]][line[0]] * sc_roundness) / sc_roundness
    }
    return result
}

/**
 * Calculates the not-normalised laplace matrix L=D-W [diagonal-adjaency]
 * @param {*} diagonal_matrix 
 * @param {*} reduced_distance_matrix 
 */
function sc_calculate_nn_laplace(diagonal_matrix, reduced_distance_matrix) {
    const D = diagonal_matrix
    const W = reduced_distance_matrix
    return math.subtract(D, W)
}

/**
 * Calcualtes the normalised random walk matrix
 * @param {*} diagonal_matrix 
 * @param {*} nn_laplace 
 */
function sc_calculate_n_rw_laplace(diagonal_matrix, nn_laplace) {
    const Dm = math.inv(diagonal_matrix)
    console.log(Dm);
    const a = math.multiply(Dm, nn_laplace)
    console.log(a);
    // for (const _a of a.entries()) {
    //     console.log('_a: ', _a);
    //     for (const b of _a[1].entries()) {
    //         console.log('b: ', b);
    //         a[_a[0]][b[0]] = Math.round(b[1] * sc_roundness) / sc_roundness
    //     }
    // }
    return a;
}

/**
 * Calcualtes eigen things, and retruns k first vektors and values
 * @param {*} a 
 */
function sc_get_eigens(a, cluster_count) {
    console.log("Using:", a);
    const result = math.eigs(a)
    console.log('result: ', result);

    let result_vec = []
    for (let i = 0; i < cluster_count; i++) {
        a = math.column(math.matrix(result.vectors), i).toArray()
        result_vec.push([])
        for (const el of a) {
            result_vec[i].push(el[0])
        }
    }
    let result_val = []
    for (let i = 0; i < cluster_count; i++) {
        result_val.push(result.values[i])
    }

    return [result_vec, result_val]
}

function sc_add_class(eigenvectors) {
    let result = JSON.parse(JSON.stringify(eigenvectors))
    for (let i = 0; i < result.length; i++) {
        result[i].push(-1);
    }
    return result
}

function sc_eigen_to_matrix(eigenvectors) {
    let result = []
    for (const el of eigenvectors[0]) {
        result.push([])
    }
    for (const element of eigenvectors.entries()) {
        for (const _el of element[1].entries()) {
            result[_el[0]][element[0]] = _el[1]
        }
    }
    return result
}

function sc_set_class_to_Cluster_result(data, clustered_eigenvectors) {
    let result = JSON.parse(JSON.stringify(data))
    for (const el of data.entries()) {
        result[el[0]][el[1].length] = clustered_eigenvectors[el[0]][clustered_eigenvectors[0].length - 1]
    }
    return result
}


console.log("TEST:");
let ac = [[10, -10, 0, 0, 0, 0, 0, 0], [-10, 10, 0, 0, 0, 0, 0, 0], [0, 0, 3, -2, -1, 0, 0, 0], [0, 0, -2, 7, -5, 0, 0, 0], [0, 0, -1, -5, 6, 0, 0, 0], [0, 0, 0, 0, 0, 22, -13, -9], [0, 0, 0, 0, 0, -13, 17, -4], [0, 0, 0, 0, 0, -9, -4, 13]]
console.log(math.column(math.eigs(ac).vectors, 0));
console.log(math.eigs(ac).values[1]);

const a = [[0, 1, -1], [0, 1, -1], [1, 0, -1], [1, 1, -1]]
let [data, doubles] = remove_doubles(a)
data.map(el => el[el.length - 1] = data.indexOf(el))
console.log("prs", parse_doubles(data, doubles));


