var btnRed = document.getElementById('red');
var btnGreen = document.getElementById('green');
let btnBlue = document.getElementById('blue');

btnRed.addEventListener('click', function(){
    d3.selectAll('svg').remove();
    circlePacking(1);
},false);

btnGreen.addEventListener('click', function(){
    d3.selectAll('svg').remove();
    circlePacking(2);
},false);

btnBlue.addEventListener('click', function(){
    d3.selectAll('svg').remove();
    circlePacking(3);
},false);

circlePacking(3);

function circlePacking(colorNumber){ 
    var svg = d3.select('#content')
    .append('svg')
    .attr('width',1100.4).attr('height',510);

    var margin = 20,
        diameter = +svg.attr("height"),
        g = svg.append("g").attr("transform", "translate(" + diameter + "," + diameter / 2 + ")");  

   if (colorNumber == 1){
        var color = d3.scaleLinear()
        .domain([-1, 7])
        .range(["rgb(255,255,255)", "rgb(220,40,40)"])
        //.range(["hsl(160,80%,80%)", "hsl(220,40%,40%)"])
        //.range(["hsl(100,50%,80%)", "hsl(228,80%,40%)"]) 
        .interpolate(d3.interpolateHcl);
   }else if(colorNumber == 2){
        var color = d3.scaleLinear()
        .domain([-1, 7])
        .range(["rgb(255,255,255)", "rgb(50,150,50)"])
        .interpolate(d3.interpolateHcl);
   }else if(colorNumber == 3){
        var color = d3.scaleLinear()
        .domain([-1, 7])
        .range(["rgb(255,255,255)", "rgb(40,40,230)"])
        .interpolate(d3.interpolateHcl);
   }else{
       console.log("error");
   }

    var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

    var stratify = d3.stratify()
            .parentId(function(d){return d.id.substring(0,d.id.lastIndexOf('@'));});

    d3.json("mydata.json", function(error, data) {
    if (error) throw error;

    root = stratify(data)
        .sum(function(d) { return d.value; })
        .sort(function(a, b) { return b.value - a.value; });

    var focus = root,
        nodes = pack(root).descendants(),
        view;

    var circle = g.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
        .style("fill", function(d) { return /* d.children ? */ color(d.depth) /* : null */; })
        .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

    var text = g.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("class", "label")
        .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
        .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
        .text(function(d) { 
            //console.log(d);
            //console.log(d.id.substring(0,d.id.lastIndexOf('@')));  
            return d.id.substring(d.id.lastIndexOf("@")+1); 
            });

    var node = g.selectAll("circle,text");

    svg
        .style("background", color(-1))
        .on("click", function() { zoom(root); });

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    function zoom(d) {
        var focus0 = focus; focus = d;

        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function(d) {
            var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
            return function(t) { zoomTo(i(t)); };
            });

        transition.selectAll("text")
        .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
            .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
            .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
    }

    function zoomTo(v) {
        var k = diameter / v[2]; view = v;
        node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function(d) { return d.r * k; });
    }
    });

}
