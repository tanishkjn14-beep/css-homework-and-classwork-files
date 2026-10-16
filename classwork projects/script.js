var choice = prompt("welcome to area calculator. \n please enter your choice, \n1 area of rectangle, \n2 area of triangle. \n3 area of circle");

if (choice == '1') {
  var l = prompt('enter  the length')
  var b = prompt("enter the breadth")
  var result = Number(l) * Number(b)
  alert('the area is ' + result)
}

if (choice == '2') {
  var h = prompt('enter the height')
  var b = prompt('Enter the base')
  var result = Number(h) * Number(b) / 2
   alert('the area is ' + result)
}

if (choice == '3') {
  var r = prompt('enter the radius')
 var result = 3.14 * Number(r) * Number(r)
   alert('the area is ' + result)
}