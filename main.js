//-jhint options
/*jshint unused:true,leanswitch:true,asi:true,esversion:8,expr:true,-W008*/

/**
 * made by S.B.
 */

/**
 * TODO:
 * - maybe project points >3d onto 3d
 * - implement knn classifier 
 * - color assing bug, second gets also shown
 * - p2_centroids class is used as coord in iteration 1(/0)
 * - gif background color
 */

var data_1 = null;
var data_2 = null;

var data_1_last_edit = null; // either "file" or "text"

var graph_1 = null;
var graph_2 = null;

var color_1 = [];
var color_2 = [];

// modifiy settings
const modify_options = {
    sync_camera: true,
    is_last_row_class: true,
    modifer: undefined,
    special_points_only_outline: true,
    tooltip: true,
    random_color: true
}

// const dom elements
const clolumn_1 = document.getElementById("column_1")
const clolumn_2 = document.getElementById("column_2")

const plot_container_1 = document.getElementById("plot_container_1")
const plot_container_2 = document.getElementById("plot_container_2")

const text_data_input_1 = document.getElementById("t_data_input_1")
const text_data_input_2 = document.getElementById("t_data_input_2")

const file_data_input_1 = document.getElementById("t_data_file_input_1")
const file_data_input_2 = document.getElementById("t_data_file_input_2")

const color_assignment_1 = document.getElementById("color_assignment_1")
const color_assignment_2 = document.getElementById("color_assignment_2")

const modify_options_sync_cam = document.getElementById("input_sync_camera")
const modify_options_last_row_is_class = document.getElementById("input_last_row_class")
const modify_options_special_point_outline = document.getElementById("input_special_point_outline")
const modify_options_tooltips = document.getElementById("input_tooltips")
const modify_options_random_color = document.getElementById("input_random_color")
const modify_options_modifier = document.getElementById("modifier_input")

const modifier_options_table = document.getElementById("modifier_options_table")

const modify_toggle = document.getElementById("modify_toggle")

const save_button_p1 = document.getElementById("save-p1")
const save_button_p2 = document.getElementById("save-p2")

// specify graph options
const graph_options = {
    width: "100%",
    height: "400px",
    style: "dot-color",
    showPerspective: false,
    showGrid: true,
    showShadow: false,
    keepAspectRatio: true,
    verticalRatio: 1,
    showGrayBottom: true,
    showLegend: false,
    showSurfaceGrid: true,
    tooltip: point => {
        // no good solution, but works [by generating an error and thus no tooltip]
        return modify_options.tooltip ? "Value: <b>[" + point.x + "," + point.y + "," + point.z + "]</b><br>Class: <b>" + point.data.class + "</b>" : _
    },
    tooltipStyle: {
        content: {
            background: 'rgba(255, 255, 255, 0.7)',
            padding: '10px',
            borderRadius: '10px',
            fontSize: '50%'
        },
        line: {
            borderLeft: '1px dotted rgba(0, 0, 0, 0.5)'
        },
        dot: {
            border: '5px solid rgba(0, 0, 0, 0.5)'
        }
    },
    backgroundColor: "#f2f2f2",

}

/**
 * hydrates site
 */
function hydrate() {
    // graph resize on window resize
    window.addEventListener("resize", redrawGraphs);
    // process data when inputed
    text_data_input_1.addEventListener("change", (e) => { processData(e.currentTarget) })
    text_data_input_2.addEventListener("change", (e) => { processData(e.currentTarget) })
    file_data_input_1.addEventListener("input", (e) => { processData(e.currentTarget) })
    file_data_input_2.addEventListener("input", (e) => { processData(e.currentTarget) })

    modify_toggle.addEventListener("click", () => { toggleColumn(), redrawGraphs() })

    save_button_p1.addEventListener("click", (e) => { save_as_image(e.currentTarget) })
    save_button_p2.addEventListener("click", (e) => { save_as_image(e.currentTarget) })

    // option triggers
    hydrate_options()
    // ...
    intitializeGraph()
}

/**
 * Hydrates the modifier/modifying options
 */
function hydrate_options() {
    modify_options_sync_cam.addEventListener("input", (e) => { modify_options.sync_camera = e.currentTarget.checked })
    modify_options_last_row_is_class.addEventListener("input", (e) => { modify_options.is_last_row_class = e.currentTarget.checked })
    modify_options_special_point_outline.addEventListener("input", (e) => { modify_options.special_points_only_outline = e.currentTarget.checked })
    modify_options_modifier.addEventListener("input", (e) => { modify_options.modifer = e.currentTarget.value; modifer() })
    modify_options_tooltips.addEventListener("input", (e) => { modify_options.tooltip = e.currentTarget.checked })
    modify_options_random_color.addEventListener("input", (e) => { modify_options.random_color = e.currentTarget.checked })
}

/**
 * Saves the corresponding canvas as png and prompts download
 * @param {*} element 
 * @returns 
 */
function save_as_image(element) {
    const p1_canvas = $("#plot_container_1 canvas")[0]
    const p2_canvas = $("#plot_container_2 canvas")[0]
    switch (element.name) {
        case "p1":
            p1_canvas.toBlob(blob => {
                saveAs(blob, "img.png");
            })
            return
        case "p2":
            p2_canvas.toBlob(blob => {
                saveAs(blob, "img.png");
            })
            return
        default:
            console.error("sth went wrong");
            break;
    }
}


/**
 * Shows modifier options based on slected modifier
 * @returns undefined
 */
function modifer() {
    // when not using modifier
    switch (modify_options.modifer) {
        case "none":
            modifier_options_table.innerHTML = "<i>Nothing to see here. No modifier selected!</i>"
            return
        case "knn":
            // modifier_options_table.innerHTML = modifier_knn.getOptionTable()
            modifier_options_table.innerHTML = "This modifier has not been created yet."
            break;
        case "kmeans":
            modifier_options_table.innerHTML = kmeans_getOptionTable()
            break;
        default:
            console.error("An error occured while selecting the modifiert");
            break;
    }
}

/**
 * intitialize graphs
 */
function intitializeGraph() {
    data_1 = new vis.DataSet()
    data_1.add({ x: 0, y: 0, z: 0, class: "none" })
    data_2 = new vis.DataSet()
    data_2.add({ x: 0, y: 0, z: 0, class: "none" })
    graph_1 = new vis.Graph3d(plot_container_1, data_1, graph_options)
    graph_2 = new vis.Graph3d(plot_container_2, data_2, graph_options)
    graph_1.on('cameraPositionChange', (e) => { sync_camera_position(1, e) })
    graph_2.on('cameraPositionChange', (e) => { sync_camera_position(2, e) })
}

/**
 * Synchonises the cameraposition of two graps 
 * @param {*} graph 
 * @param {*} event 
 */
function sync_camera_position(graph, event) {
    if (modify_options.sync_camera) {
        if (graph == 1) {
            graph_2.setCameraPosition({ horizontal: event.horizontal, vertical: event.vertical, distance: event.distance })
        } else {
            graph_1.setCameraPosition({ horizontal: event.horizontal, vertical: event.vertical, distance: event.distance })
        }
    }
}

/**
 * redraw graphs
 */
function redrawGraphs() {
    graph_1.redraw()
    graph_2.redraw()

}

/**
 * Updtaes display of color assignment
 */
function updateColorAssignment() {
    generellColorAssignment(color_1, color_assignment_1)
    if (!clolumn_2.classList.contains("display-none") && color_2 != null) {
        generellColorAssignment(color_2, color_assignment_2)
    }
}

/**
 * Generates the color info table
 * @param {*} colors 
 * @param {*} container 
 */
function generellColorAssignment(colors, container) {
    let output = "<table class=\"color_table\"><tr><th>Cluster</th><th>Color</th></tr>"
    let output_ender = "</table>"
    for (const color of colors) {
        output += "<tr>"
        output += "<td>" + color[0] + "</td>"
        output += "<td><div class='tooltip'><div class='color_preview' style='background-color:" + color[1] + ";'></div><span class='tooltiptext'>" + color[1] + "</span></div></td>"
        output += "</tr>"
    }
    container.innerHTML = output + output_ender
}

/**
 * On input of data, process, display it and update color assignment
 * @param {*} input_field 
 */
async function processData(input_field) {
    switch (input_field) {
        case text_data_input_1:
            process_t1_data()
            data_1_last_edit = "text"
            break
        case text_data_input_2:
            process_t2_data()
            break
        case file_data_input_1:
            await process_f1_data()
            data_1_last_edit = "file"
            break
        case file_data_input_2:
            await process_f2_data()
            break
        default:
            console.log("sth went wrong");
            break
    }
    redrawGraphs()
    updateColorAssignment()
    if (color_assignment_1.classList.contains("display-none")) {
        color_assignment_1.classList.remove("display-none")
    }
    if (color_assignment_2.classList.contains("display-none")) {
        color_assignment_2.classList.remove("display-none")
    }
}

/**
 * takes input data from t1 and draw graph
 */
function process_t1_data() {
    let input_data_g = new vis.DataSet()
    let input_data = text_data_input_1.value
    color_1 = modify_options.random_color ? [] : color_1
    const [data, special_data] = dataFromCsvString(input_data, true)
    for (const dataPoint of data) {
        const coords = dataPoint
        color_1 = addToColor(color_1, coords[coords.length - 1])
        // expand to 3 coords
        while (coords.length < 4) {
            coords.splice(coords.length - 1, 0, 0)
        }
        input_data_g.add({ x: parseFloat(coords[0]), y: parseFloat(coords[1]), z: parseFloat(coords[2]), style: getColor(color_1, coords[coords.length - 1]), class: coords[coords.length - 1] })
    }
    for (const [index, dataPoint] of special_data.entries()) {
        const coords = dataPoint
        color_1 = addToColor(color_1, modify_options.special_points_only_outline ? index : "Special Point")
        coords.push(modify_options.special_points_only_outline ? index : "Special Point")
        // expand to 3 coords
        while (coords.length < 4) {
            coords.splice(coords.length - 1, 0, 0)
        }
        let style = { fill: getColor(color_1, modify_options.special_points_only_outline ? index : "Special Point"), stroke: "#000" }
        input_data_g.add({ x: parseFloat(coords[0]), y: parseFloat(coords[1]), z: parseFloat(coords[2]), style: style, class: modify_options.special_points_only_outline ? index : "Special Point" })
    }
    graph_1.setData(input_data_g)
}

/**
 * takes input data from t2 and draw graph
 */
function process_t2_data() {
    let input_data_g = new vis.DataSet()
    let input_data = text_data_input_2.value
    color_2 = modify_options.random_color ? [] : color_2
    const [data, special_data] = dataFromCsvString(input_data, true)
    for (const dataPoint of data) {
        const coords = dataPoint
        color_2 = addToColor(color_2, coords[coords.length - 1])
        // expand to 3 coords
        while (coords.length < 4) {
            coords.splice(coords.length - 1, 0, 0)
        }
        let style = getColor(color_2, coords[coords.length - 1])
        input_data_g.add({ x: parseFloat(coords[0]), y: parseFloat(coords[1]), z: parseFloat(coords[2]), style: style, class: coords[coords.length - 1] })
    }
    for (const [index, dataPoint] of special_data.entries()) {
        const coords = dataPoint
        color_2 = addToColor(color_2, modify_options.special_points_only_outline ? index : "Special Point")
        coords.push(modify_options.special_points_only_outline ? index : "Special Point")
        // expand to 3 coords
        while (coords.length < 4) {
            coords.splice(coords.length - 1, 0, 0)
        }
        let style = { fill: getColor(color_2, modify_options.special_points_only_outline ? index : "Special Point"), stroke: "#000" }
        input_data_g.add({ x: parseFloat(coords[0]), y: parseFloat(coords[1]), z: parseFloat(coords[2]), style: style, class: modify_options.special_points_only_outline ? index : "Special Point" })
    }
    graph_2.setData(input_data_g)
}

/**
 * takes input data from f1 and draw graph
 */
async function process_f1_data() {
    let file = file_data_input_1.files[0]
    let content = await new Promise((resolve) => {
        let file_reader = new FileReader()
        file_reader.readAsText(file, "UTF-8")
        file_reader.onload = (e) => {
            resolve(file_reader.result)
        }
    })
    text_data_input_1.value = "//" + content
    process_t1_data()
}

/**
 * takes input data from f2, process and draw graph
 */
async function process_f2_data() {
    let file = file_data_input_2.files[0]
    let content = await new Promise((resolve) => {
        let file_reader = new FileReader()
        file_reader.readAsText(file, "UTF-8")
        file_reader.onload = (e) => {
            resolve(file_reader.result)
        }
    })
    text_data_input_2.value = "//" + content
    process_t2_data()
}


/**
 * Adds a Color and Class to the color list, if not already present, and returns new list
 * @param {*} colors_now 
 * @param {*} class_ 
 * @returns new Color list
 */
function addToColor(colors_now, class_) {
    if (colors_now != undefined) {
        for (const element of colors_now) {
            if (element[0] == class_) {
                // color already indexed,
                return colors_now
            }
        }
    }
    let randomColor = randomHexColor();
    colors_now.push([class_, randomColor])
    return colors_now
}

/**
 * Returns the color of class from color list, or nothing if not found
 * @param {Current Color list} colors 
 * @param {Wanted color class} class_ 
 * @returns 
 */
function getColor(colors, class_) {
    for (const color of colors) {
        if (color[0] == class_) {
            return color[1]
        }
    }
    console.error("No color found!")
}

/**
 * Toggles the modify column
 */
function toggleColumn() {
    if (clolumn_2.classList.contains("display-none")) {
        clolumn_2.classList.remove("display-none")
        clolumn_1.classList.add("column-50")
        clolumn_1.classList.remove("column-100")
    } else {
        clolumn_2.classList.add("display-none")
        clolumn_1.classList.add("column-100")
    }
    redrawGraphs()
}

hydrate();


