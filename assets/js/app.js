// @TODO: YOUR CODE HERE!
// @TODO: YOUR CODE HERE!
//define size of svg and margin
var svgWidth = 1000;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#scatter")
	.append("svg")
	.attr("width",svgWidth)
	.attr("height",svgHeight);

//Append SVG group
var chartGroup = svg.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`);


//initial x and y axis
var chosenX = "poverty";
var chosenY = "healthcare";

//setup function to setup scales based on selected axis "x" or "y"
function setScale(hwData, chosenScale,xORy){
	
	if (xORy ==="x"){
		var xLinearScale = d3.scaleLinear()
			.domain([d3.min(hwData, d => d[chosenX]*0.9)
				,d3.max(hwData, d=>d[chosenX]*1.1)])
			.range([0,width]);
		return xLinearScale;
	}
	else {
		var yLinearScale = d3.scaleLinear()
			.domain([d3.min(hwData, d => d[chosenY]*0.9)
				,d3.max(hwData, d=>d[chosenY]*1.1)])
			.range([height,0]);
		return yLinearScale;
	}
	
};



//setup function to set tooltip based on chosenX and chosenY
function updateTooltip (group,chosenX,chosenY){
	
	if (chosenX==="poverty") {var percentageMark = "%"}
		else {var percentageMark = ""}

	var toolTip = d3.tip()
	    .attr("class", "d3-tip")
	    .html(function(data) {
	      return (`${data.state}<br>${chosenX}: ${data[chosenX]}${percentageMark}<br>${chosenY}: ${data[chosenY]}%`);
	    });

	group.call(toolTip);

	group.on("mouseover", function(data) {
		toolTip.show(data,this);
	})
	    // onmouseout event
		.on("mouseout", function(data) {
	    	toolTip.hide(data);
	    });

	  return group;
}


//define function to updateAxis based on selected axis "x" or "y"
function updateAxis(newScale, chosenAxis, xORy){
	if(xORy ==="x"){
		var bottomAxis = d3.axisBottom(newScale);

		chosenAxis.transition()
		    .duration(1000)
		    .call(bottomAxis);
	
		return chosenAxis;
	}
	else{
		var leftAxis = d3.axisLeft(newScale);

		chosenAxis.transition()
		    .duration(1000)
		    .call(leftAxis);
	
		return chosenAxis;
	}
	
}




//function to update both group base on selected axis "x" or "y"
function updateGroup (circleGroup,textGroup, newScale,chosenAxis, xORy){
	if (xORy ==="x"){
		circleGroup.transition()
		    .duration(1000)
		    .attr("cx", d => newScale(d[chosenAxis]));
		textGroup.transition()
		    .duration(1000)
		    .attr("x", d => newScale(d[chosenAxis]));

  		return circleGroup,textGroup;
	}
	else {
		circleGroup.transition()
		    .duration(1000)
		    .attr("cy", d => newScale(d[chosenAxis]));
		textGroup.transition()
		    .duration(1000)
		    .attr("y", d => newScale(d[chosenAxis])+6.5);

  		return circleGroup,textGroup;
	}
}


//import data from csv
d3.csv("assets/data/data.csv", function(error, hwData) {
	if (error) console.warn(error);
	console.log(hwData);

	//parse data
	hwData.forEach(function(data){
		data.poverty = +data.poverty;
		data.age = +data.age;
		data.income = +data.income;
		data.healthcare = +data.healthcare;
		data.obesity = +data.obesity;
		data.smokes = +data.smokes;


	});

	//setup initial scale and axis
	var xLinearScale = setScale(hwData, chosenX,"x");
	var yLinearScale = setScale(hwData, chosenY,"y");

	var bottomAxis = d3.axisBottom(xLinearScale);
  	var leftAxis = d3.axisLeft(yLinearScale);

  	var xAxis = chartGroup.append("g")
  		.classed("x-axis",true)
  		.attr("transform", `translate(0, ${height})`)
    	.call(bottomAxis);

    var yAxis = chartGroup.append("g")
    	.classed("y-axis", true)
    	.call(leftAxis);

    //create group for all the circles
    var circleGroup = chartGroup.selectAll("circle")
    	.data(hwData)
    	.enter()
    	.append("circle")
    	.classed("stateCircle", true)
    	.attr("cx", d => xLinearScale(d[chosenX]))
    	.attr("cy", d => yLinearScale(d[chosenY]))
    	.attr("r", 13);

    //create group for all the state abbr texts
    var textGroup = chartGroup.selectAll("text .stateText")
    	.data(hwData)
    	.enter()
    	.append("text")
    	.classed("stateText",true)
    	.attr("x", d => xLinearScale(d[chosenX]))
    	.attr("y", d => yLinearScale(d[chosenY])+6.5)
    	.text(d => d.abbr);

   	//add tooltip to both circle and text groups
	circleGroup = updateTooltip(circleGroup,chosenX,chosenY);
	
	textGroup = updateTooltip(textGroup,chosenX,chosenY)

	//xlabel group
    var xLableGroup = chartGroup.append("g")
    	.attr("transform", `translate(${width / 2}, ${height + 20})`);

	// setup x-axis lable option
    var povertyLable = xLableGroup.append("text")
    	.attr("x",0)
    	.attr("y",20)
    	.attr("value", "poverty")
    	.classed("active",true)
    	.text("In Poverty (%)")

    var ageLable = xLableGroup.append("text")
    	.attr("x",0)
    	.attr("y",40)
    	.attr("value", "age")
    	.classed("inactive",true)
    	.text("Age (Median)")

    var incomeLable = xLableGroup.append("text")
    	.attr("x",0)
    	.attr("y",60)
    	.attr("value", "income")
    	.classed("inactive",true)
    	.text("Hosehold Income(Median)")

	//setup y-axis lable option
	var yLableGroup = chartGroup.append("g")
    .attr("transform", `translate(-100, ${height/2})`)

    var obeseLable = yLableGroup.append("text")
    	.attr("transform", "rotate(-90)")
	    .attr("y",0)
	    .attr("x",0)
	    .attr("value","obesity")
	    .attr("dy", "1em")
	    .classed("inactive", true)
	    .text("Obese (%)");

	var smokeLable = yLableGroup.append("text")
    	.attr("transform", "rotate(-90)")
	    .attr("y",20)
	    .attr("x",0)
	    .attr("value","smokes")
	    .attr("dy", "1em")
	    .classed("inactive", true)
	    .text("Smokes (%)");

	var healthcareLable = yLableGroup.append("text")
    	.attr("transform", "rotate(-90)")
	    .attr("y",40)
	    .attr("x",0)
	    .attr("value","healthcare")
	    .attr("dy", "1em")
	    .classed("active", true)
	    .text("Lacks Healthcare (%)");

	//x-lable click listener
	xLableGroup.selectAll("text")
		.on("click", function(){
		
			var xNew = d3.select(this).attr("value");

			if (xNew !=chosenX){

				//set new chosenX
				chosenX=xNew;

				//update all scale, xaxis, both group based on new chosenX
				xLinearScale = setScale(hwData, chosenX,"x");

				xAxis = updateAxis(xLinearScale, xAxis,"x");

				circleGroup,textGroup = updateGroup (circleGroup,textGroup, xLinearScale,chosenX, "x");

				circleGroup = updateTooltip(circleGroup,chosenX,chosenY);
				textGroup = updateTooltip(textGroup,chosenX,chosenY);

				if (xNew === "poverty"){
					povertyLable.classed("inactive",false)
						.classed("active",true);
					ageLable.classed("inactive",true)
						.classed("active",false);
					incomeLable.classed("inactive",true)
						.classed("active",false);
				}
				else if (xNew === "age") {
					povertyLable.classed("inactive",true)
						.classed("active",false);
					ageLable.classed("inactive",false)
						.classed("active",true);
					incomeLable.classed("inactive",true)
						.classed("active",false);
				}

				else {
					povertyLable.classed("inactive",true)
						.classed("active",false);
					ageLable.classed("inactive",true)
						.classed("active",false);
					incomeLable.classed("inactive",false)
						.classed("active",true);
				}
			}
		})

	//y-lable click listener
	yLableGroup.selectAll("text")
		.on("click", function(){
		
			var yNew = d3.select(this).attr("value");

			if (yNew !=chosenY){

				//set new chosenY
				chosenY=yNew;

				//update all scale, yaxis, both group based on new chosenY
				yLinearScale = setScale(hwData, chosenY,"y");

				yAxis = updateAxis(yLinearScale, yAxis,"y");

				circleGroup,textGroup = updateGroup (circleGroup,textGroup, yLinearScale,chosenY, "y");

				circleGroup = updateTooltip(circleGroup,chosenX,chosenY);
				textGroup = updateTooltip(textGroup,chosenX,chosenY);


				if (yNew === "obesity"){
					obeseLable.classed("inactive",false)
						.classed("active",true);
					smokeLable.classed("inactive",true)
						.classed("active",false);
					healthcareLable.classed("inactive",true)
						.classed("active",false);
				}
				else if (yNew === "smokes") {
					obeseLable.classed("inactive",true)
						.classed("active",false);
					smokeLable.classed("inactive",false)
						.classed("active",true);
					healthcareLable.classed("inactive",true)
						.classed("active",false);
				}

				else {
					obeseLable.classed("inactive",true)
						.classed("active",false);
					smokeLable.classed("inactive",true)
						.classed("active",false);
					healthcareLable.classed("inactive",false)
						.classed("active",true);
				}
			}
		})

})