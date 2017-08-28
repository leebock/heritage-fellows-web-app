function Helper()
{

}

Helper.unique = function(list)
{
	var n = []; 
	for(var i = 0; i < list.length; i++) 
	{
		if (n.indexOf(list[i]) === -1) {
			n.push(list[i]);
		}
	}
	return n;
};	