var treeDepth = 8;
var slider = d3.select('#slider').node();
slider.addEventListener("change", function(e){
    treeDepth = e.target.value;
    d3.selectAll('svg').remove();
    renderTreeChart(treeDepth);
},false);

renderTreeChart(treeDepth);

function renderTreeChart(treeDepth){
    var svg = d3.select('#content')
        .append('svg')
        .attr('width',1100).attr('height',510);

    var width = svg.attr('width'),
        height = svg.attr('height'),
        g = svg.append('g').attr('transform','translate(50,20)');

    var tree = d3.tree().size([height-50,width-500])
            .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    var stratify = d3.stratify()
        .parentId(function(d){return d.id.substring(0,d.id.lastIndexOf('@'));});
    
    
    d3.csv("MetaLab.iMetaLab.tree.csv",function(error,data){
        if(error) throw error;

        var root = tree(stratify(data));

       var rootData = root.descendants();
        var x;
        for (x in rootData)
        {
            if (rootData[x].depth == treeDepth)
            {
                rootData[x].children = [];
            }
            if (rootData[x].depth > treeDepth)
            {
                rootData.splice(x,1);
            }
        }
      
        var link = g.selectAll(".link")
        .data(root.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
         .attr("d", function(d) {
            return "M" + d.y + "," + d.x
		    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
		    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
            + " " + d.parent.y + "," + d.parent.x;
        });

        var node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
            .attr("transform", function(d) { 
                return "translate(" + d.y + "," + d.x + ")"; 
            });
                   
        //A map of Depth-Color
        var map = {0:'#F20CE3',1:'#7829F0',2:'#3731D8',3:'#5286EA',4:'#52B7EA',5:'#52DCEA',6:'#52EAD5',7:'#54FFAA',8:'#C0C84F'};
        node.append("circle")
            .attr("r", function(d){return (d.data.value)*(d.data.value)/1500+1;})
            .style("fill",function(d){
                return map[d.depth];
            });
       
        node.on("mouseover",function(d){
                    var x =d3.event.pageX-180;
                    var y =d3.event.pageY-500;
                    svg.append("text")
                        .attr("id","tooltip")    				
                        .attr("x",x)
                        .attr("y", y)
                        .attr("text-anchor","end")  
                        .attr("font-family","sans-setif")  
                        .attr("font-size","11px")  
                        .attr("font-weight","bold")  
                        .attr("fill","black")  
                        .text('hello')
                        .text(d.id.substring(d.id.lastIndexOf("@")+1)+':'+d.data.value);
                   
            });
        node.on('mouseout',function(d){
                d3.selectAll('#tooltip').remove();
            });
        
        node.on('click',function(d){
             d3.select(this).append("circle")
               .attr("r", function(d){return (d.data.value)*(d.data.value)/1500+1;})
               .attr("id","highlight")
               .style("fill","red");
        });
        svg.on('dblclick',function(d){
            svg.selectAll('#highlight').remove();
        });
    });

    //Drag & Zoom in/out
    var view = svg
    .selectAll("g")
    
    var zoom = d3
    .zoom()
    .scaleExtent([0.1, 100])
    .on("zoom", () => {
        var transform = d3.event.transform;
        view.selectAll(".node").attr("transform", function(d){
            return "translate("+transform.applyX(d.y)+","+transform.applyY(d.x)+")";
		});
        view.selectAll(".link").attr("d", function(d) {
	    	return "M" + transform.applyX(d.y) + "," + transform.applyY(d.x)
	        + "C" + (transform.applyX(d.y) + transform.applyX(d.parent.y)) / 2 + "," + transform.applyY(d.x)
	        + " " + (transform.applyX(d.y) + transform.applyX(d.parent.y)) / 2 + "," + transform.applyY(d.parent.x)
            + " " + transform.applyX(d.parent.y) + "," + transform.applyY(d.parent.x);
          });
    });
    svg.call(zoom).on("dblclick.zoom", () => {});
}


function showFunction(){
    //var node = d3.selectAll('node');
    var node = d3.selectAll(".node");
    node.append("text")
        .attr("class",'details')
        .attr("text-anchor", function(d){return d.children ? "end" : "start"})
        .attr("x",5)
        .attr("y", function(d) { return -(d.data.value/10 + 1) ; })
        //.style("text-anchor", function(d) { return d.children ? "end" : "start"; })
        .text(function(d) { return d.id.substring(d.id.lastIndexOf("@")+1)});
};
function hideFunction(){
    d3.selectAll('.details').remove();
};

function project(x, y){
	var angle = (x-90)/180 * Math.PI, radius = y;
	return [radius*Math.cos(angle), radius*Math.sin(angle)];
};


