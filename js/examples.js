// ****************   DATA TYPES  ********************
var number = 3 //notice no quotation marks
console.log(typeof (number)); //typeof is a way for you to SEE what the datatype is

var astring = "Data that is not a number - words, characters ..." //notice they characters are enclosed in quotations
console.log(typeof (aString)); //javascaript is CASE SenSiTiVe !!!!!!

var aBoolean = true // or false
console.log(typeof (aBoolean));

var aUndefined //a variable which has been declared, but not given a value
console.log(aUndefined); // you can't print out the data of a variable if it doesn't exist, hence undefined
console.log(typeof (aUndefined));

var aNull = null // a null is a value where we intentionally gave it a 'value', so it won't be  undefined, but we don't know the actual value yet
console.log(aNull);


// *******************  VARIABLES - DECLARATION, ASSIGNMENT , INITIALIZATION   ******************
// Declare a variable means to tel the computer you want to save a place in memory to put in some data
var personName; //that data storage place will be henceforth known as personName

//Assignment means you are putting some data into that storage location at a later time
personName = "Gunther"; //notice the variable name - no spaces, utlizes the camelcase convention

//Initialization does both Declare and Assign at the same time
let personAge = 21;

//One of the differences between var and let is that you can declare the same variable twice with var (bad practice)
var myPet = "Dog";
var myPet = "Cat";
//** if you want to give myPet another value use the Assignment as done above */
myPet = "Horse";


//You CAN't redeclare the same value using let - you will get a 'compile error'
// let myPet = "Dog";
// let myPet = "Cat";

// DATA COERSION
// javascript has to guess at what the data types are - so often times changes the data type in order to do the expression at hand
console.log(3 + 5); // outputs 8
console.log("3" + 5); // outputs 35
console.log("10" / 5) // outputs 2

let stringName = "Kirsten";
console.log(Boolean(stringName));



//*************************  Truthy and Falsy *****************************
/*
    Falsy - 
        * Any value that is 0, empty string "", undefined, null, or NaN (not a number)
        * Everything Without a "Value" is False`
    Truthy - Everything else 
*/

let zero = 0;
console.log(Boolean(zero));

let emptyString = "";
console.log(Boolean(emptyString));

let undeFined;
console.log(Boolean(undeFined));

let nUll = null;
console.log(Boolean(nUll));

let nan = 6 / "a";
console.log(nan)
console.log(Boolean(nan));



/*
    Falsy - 
        * Any value that is 0, empty string "", undefined, null, or NaN (not a number)
        * Everything Without a "Value" is False`
    Truthy - Everything else 
*/


// ************** LOGICAL OPERATORS  (&&  and ||)  - used to return a TRUE of FALSE (not truthY)  *******************
// && checks both sides to see if they are truthy or falsy

// IF both sides are TRUTHY - the last truthy value is 'returned' or provided
console.log(1 && "Going to the Park"); //both sides are TRUTHY so both sides evaluate to true 
//ELSE the first falsy value is 'returned' or provided
console.log(null && 7); // null is falsy SO both sides aren't TRUE - so the first falsy is returned

//  ||  (usually found above the / on your keyboard) is the OR operator - only one side has to evaluate to TRUE
//returns the first TRUTHY or the last FALSY

// lets look at TRUE
console.log("Swimming in the pool" || "Jumping"); //both sides are truthy, but only one needs to be truthy to evaluate to an overall TRUE
console.log("Swimming in the pool" || 7); //only one side is TRUTHY but since this is an OR this evaluates to TRUE

//How about FALSE 
console.log("" || 0); //both sides are FALSY so equation evaluates to FALSE so the last falsy is returned



// ***************************** COMPARISON OPERATORS *****************************
//  ********************* Using the equal signs for comparison *****************************
//   ==  two equals signs looks at both sides and decides if the values are the same
let aNumberValue = 3;
let aStringValue = "3";
console.log(aNumberValue == aStringValue); // coersion - js changes the datatype for comparison

// ===  three equal signs - no coersion - strict comparison - is the datatype the same AND the values the same
console.log(aNumberValue === aStringValue);


// ******************* IF DECISION BLOCK ********************
let price;
let age = 56;
if (age < 6) {
    price = 0;
} else if (age >= 55) {
    price = 6;
}
else {
    price = 8;
}
console.log(price);

// From the slide
if (!('a' > 'z') || (undefined === null)) {
    console.log("Foo");
} else {
    console.log("Bar");
}

// *****************  SWITCH  DECISON BLOCK ********************
let weather = "raining";
switch (weather) {
    case ("raining"):
        console.log("Bring an umbrella");

    case ("sunny"):
        console.log("Wear your shades");

    case ("snowing"):
        console.log("Bring a carrot - the snowman will need a nose")

    default:
        console.log("Pack a lunch!")
}

// Example for the slice
let diceRoll = 5;
    switch (diceRoll) {
        case 1:
            console.log("You have rolled a 1");
        case 2:
            console.log("You have rolled a 2");
        case 3:
            console.log("You have rolled a 3");
        case 4:
            console.log("You have rolled a 4");
        case 5:
            console.log("You have rolled a 5");
        case 6:
            console.log("You have rolled a 6");    
        default:
            console.log("Unknown roll")
    }

//  example of a switch where the removing the break makes sense
var dayOfTheWeek = "Tuesday";

switch (dayOfTheWeek) {
    case "Monday":
    case "Tuesday":
    case "Wednesday":
    case "Thursday":
    case "Friday":
        console.log("Weekday");
        break;
    case "Saturday":
    case "Sunday":
        console.log("Weekend");
        break;
    default:
        console.log("The incorrect day of the week was put into the variable")
}

// more practice
var sunny = true;
var hot = false;
var raining = true;

if (sunny && hot) {
    console.log("Wear shorts today");
} else if (raining && !hot) {
    console.log("Bring an umbrella and wear pants")
} else if (raining) {
    console.log("Bring an umbrella");
} else {
    console.log("Check your weather app for more details");
}
