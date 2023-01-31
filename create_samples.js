//-jhint options
/*jshint unused:true,leanswitch:true,asi:true,esversion:8,expr:true,-W008*/

/**
 * Creates a circle around x/y
 * @param {Radius} r 
 * @param {Center X} x 
 * @param {Center Y} y 
 * @param {Random factor 0-1}
 * @param {*} data 
 */
function make_circle(r, x, y, _class, data, random, density) {
    step = 2 * Math.PI / (density * 100);
    for (let i = 0, angle = 0; i < density * 100; i++, angle += step) {
        data.push([x + Math.sin(angle) * r, y + Math.cos(angle) * r, _class])
    }
}

/**
 * Creates sqaure at x/y
 * @param {Length} a 
 * @param {*} x 
 * @param {*} y 
 * @param {*} data 
 */
function make_square(a, x, y, _class, data, random, density) {
    for (let i = 0; i < a; i += density) {
        data.push([x + Math.round(i * 1000) / 1000, y + (.5 - Math.random()) * random, _class])
        data.push([x + Math.round(i * 1000) / 1000, y + a + (.5 - Math.random()) * random, _class])
        data.push([x + (.5 - Math.random()) * random, y + i, _class])
        data.push([x + a + (.5 - Math.random()) * random, y + i, _class])
    }
}

function make_line(x1, y1, x2, y2, _class, data, random, density) {
    vec = [x2 - x1, y2 - y1]
    l = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1])
    ppl = (density / l)
    count = 1;
    while (ppl * count <= 1) {
        [_x, _y] = [x1 + vec[0] * ppl * count, y1 + vec[1] * ppl * count]
        data.push([_x, _y, _class])
        count++
    }
}

let data = []
// make_circle(1.5, 2.5, 2.5, 11, data, 0.5)
// make_square(5, 0, 0, 10, data, 0.3, 1)
// make_square(1, 2.5, 2.5, 11, data, .1, .1)

// make_line(1, 1, 5, 5, 12, data, 0, 0.2)
// make_line(2, 3, 7, 11, 11, data, 0, 0.2)
// make_circle(.5, 0, 0, 10, data, 0, 0.1)
// make_square(3, 0, 9, 13, data, 0, 0.5)

// make_circle(10, 0, 0, 0, data, 0, 0.5)
// make_circle(6, 0, 0, 0, data, 0, 0.5)
// make_circle(2, 0, 0, 0, data, 0, 0.5)

// make_line(0, 0, 10, 5, 1, data, 0, .3)
// make_line(5, 3, 5, 10, 2, data, 0, .3)
// make_line(8, 8, 6, 9, 3, data, 0, .3)
// make_line(4, 4, 6, 6, 4, data, 0, .3)
// make_line(1, 1, 1, 8, 5, data, 0, .8)

make_circle(5, 0, 0, 0, data, 0, .5)
make_circle(3, 0, 0, 1, data, 0, .5)

let output = "//x,y,z,class"
for (const el of data) {
    output += "\n"
    output += el[0] + "," + el[1] + "," + el[2] //+ "," + el[3]
}
console.log(output);