// Custom Date function to display a date in MM/DD/YYYY format
/*Date.prototype.longFormat = function() {
	var monthname=new Array("January","February","March","April","May","June","July","August","September","October","November","December");
	return monthname[this.getMonth()] + " " + this.getDate() + ", " + this.getFullYear();
}*/
Date.prototype.shortFormat = function() {
  return (this.getMonth() + 1) + "/" + this.getDate() + "/" + this.getFullYear();
}
